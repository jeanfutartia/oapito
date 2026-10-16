import type { Incident, DecisionType, MatchReport, Team, PreMatchStoryline, RadioChatMessage, MediaMesaRedonda, DecisionVerdictReport } from '../types/types';

// Modelo oficial do Google AI Studio
const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-2.0-flash'];

async function requestGemini(prompt: string, apiKey: string): Promise<string | null> {
  if (!apiKey || !apiKey.trim()) return null;

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch {
      // tenta fallback
    }
  }
  return null;
}

export async function testGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Informe a chave de API antes de testar.' };
  }

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Responda estritamente: CONECTADO' }] }]
        })
      });

      if (response.ok) {
        return { success: true, message: `Conexão validada com sucesso via ${model}!` };
      } else {
        const errData = await response.json().catch(() => ({}));
        const errorMsg = errData?.error?.message;
        if (errorMsg && errorMsg.includes('is no longer available')) {
          continue;
        }
        return { success: false, message: errorMsg || `Erro HTTP ${response.status} em ${model}` };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão de rede';
      return { success: false, message: msg };
    }
  }

  return { success: false, message: 'Não foi possível validar nos modelos testados.' };
}

export async function sendInteractiveVarRadioMessage(
  incident: Incident,
  history: RadioChatMessage[],
  apiKey?: string
): Promise<string> {
  const dynamicFallbacks = [
    `"Analisamos o ponto exato do lance na região: ${incident.pitchZone.name}. Há uma imagem clara no replay. Recomendamos que você venha ao monitor revisar."`,
    `"Revimos a jogada com as câmeras. A intensidade do impacto no atleta número ${incident.victimPlayerNumber} foi excessiva. Se mantiver a decisão de campo, confirme agora."`,
    `"Revimos a jogada anterior. Não encontramos irregularidades. A avaliação da gravidade disciplinar cabe a você no monitor."`
  ];

  if (!apiKey || !apiKey.trim()) {
    return dynamicFallbacks[Math.floor(Math.random() * dynamicFallbacks.length)];
  }

  const conversationHistory = history
    .map(h => `${h.sender === 'VAR' ? '[CABINE DO VAR]' : '[ÁRBITRO EM CAMPO]'}: "${h.text}"`)
    .join('\n');

  const prompt = `Você é o ÁRBITRO ASSISTENTE DE VÍDEO (VAR) oficial conversando em tempo real pelo canal de rádio com o árbitro principal em campo.
LANCE ATUAL: "${incident.title}" no minuto ${incident.minute}'
REGIÃO: ${incident.pitchZone.name}
DETALHES: ${incident.description}
REGRA OFICIAL: ${incident.ifabExplanation}

HISTÓRICO DA CONVERSA:
${conversationHistory}

Responda diretamente à última colocação do árbitro em linguagem simples, como se explicasse a um torcedor, sem termos técnicos. Máximo 2 frases curtas sem prefixos.`;

  const res = await requestGemini(prompt, apiKey);
  return res ? res.trim().replace(/^[VAR]:\s*/i, '').replace(/^"|"$/g, '') : dynamicFallbacks[0];
}

export async function generateComprehensivePostMatchMedia(
  homeTeam: string,
  awayTeam: string,
  score: string,
  uefaScore: number,
  refereeName: string,
  decisionsHistory: { incident: Incident; initial: DecisionType; final: DecisionType; isCorrect: boolean }[],
  apiKey?: string
): Promise<{ mediaMesaRedonda: MediaMesaRedonda; decisionVerdicts: DecisionVerdictReport[] }> {
  
  const fallbackMesa: MediaMesaRedonda = {
    programName: 'Mesa Redonda • Debate Pós-Jogo',
    headline: uefaScore >= 8.35 
      ? `ARBITRAGEM SEGURA: ${refereeName} domina os ânimos no clássico ${homeTeam} ${score} ${awayTeam}!`
      : `DEBATE FERVE: Decisões polêmicas de ${refereeName} geram revolta em ${homeTeam} ${score} ${awayTeam}!`,
    refereeExpertAnalysis: `Central do Apito: "O árbitro teve uma atuação de alto nível de exigência. Mostrou personalidade nos lances decisivos e manteve o critério disciplinar alinhado às regras oficiais."`,
    journalistOpinion: `Bancada de Debates: "Jogo de nervos à flor da pele. O árbitro não se acovardou diante da pressão das arquibancadas e garantiu a legitimidade do resultado esportivo."`,
    verdictSummary: uefaScore >= 8.35 ? 'APROVADO COM ELOGIOS PELA CRÍTICA' : 'SOB FORTE ESCRUTÍNIO DA IMPRENSA'
  };

  const fallbackVerdicts: DecisionVerdictReport[] = decisionsHistory.map(dh => ({
    minute: dh.incident.minute,
    incidentTitle: dh.incident.title,
    refereeDecision: dh.final,
    recommendedDecision: dh.incident.recommendedVarDecision,
    isCorrect: dh.isCorrect,
    geminiAnalysis: dh.isCorrect
      ? `Acerto do árbitro: A decisão de aplicar "${dh.final}" foi perfeita à luz da regra oficial. O lance exigia leitura rápida do ponto de contato e o juiz não se deixou levar pela encenação.`
      : `Erro de arbitragem: A marcação de "${dh.final}" divergiu da regra oficial. O lance demandava interpretação contrária (${dh.incident.recommendedVarDecision}), comprometendo a nota técnica.`
  }));

  if (!apiKey || !apiKey.trim()) {
    return { mediaMesaRedonda: fallbackMesa, decisionVerdicts: fallbackVerdicts };
  }

  const decisionsListText = decisionsHistory.map((dh, idx) => 
    `Lance ${idx + 1} (${dh.incident.minute}'): "${dh.incident.title}". Decisão tomada: "${dh.final}". Decisão recomendada: "${dh.incident.recommendedVarDecision}". Resultado: ${dh.isCorrect ? 'ACERTO' : 'ERRO'}. Regra IFAB: ${dh.incident.ifabExplanation}`
  ).join('\n');

  const prompt = `Você é a bancada esportiva do programa "Central do Apito / Linha de Passe".
Analise a atuação do árbitro principal ${refereeName} no jogo ${homeTeam} ${score} ${awayTeam}.
Nota técnica da comissão: ${uefaScore.toFixed(2)}.

LANCES JULGADOS:
${decisionsListText || 'Sem lances capitais.'}

Retorne estritamente um JSON com a estrutura:
{
  "mediaMesaRedonda": {
    "programName": "Central do Apito • Análise Oficial",
    "headline": "manchete sobre o árbitro",
    "refereeExpertAnalysis": "relato do ex-árbitro comentarista sobre o critério geral",
    "journalistOpinion": "opinião do comentarista de TV",
    "verdictSummary": "APROVADO COM LOUVOR ou SOB CRÍTICAS SEVERAS"
  },
  "decisionVerdicts": [
    {
      "minute": número_do_minuto,
      "incidentTitle": "título do lance",
      "refereeDecision": "decisão tomada",
      "recommendedDecision": "decisão correta",
      "isCorrect": true_ou_false,
      "geminiAnalysis": "relato detalhado de 2 a 3 frases explicando o porquê do acerto ou erro."
    }
  ]
}
Apenas o JSON puro, sem markdown.`;

  const raw = await requestGemini(prompt, apiKey);
  if (!raw) return { mediaMesaRedonda: fallbackMesa, decisionVerdicts: fallbackVerdicts };

  try {
    const text = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);
    return {
      mediaMesaRedonda: parsed.mediaMesaRedonda || fallbackMesa,
      decisionVerdicts: parsed.decisionVerdicts?.length ? parsed.decisionVerdicts : fallbackVerdicts
    };
  } catch {
    return { mediaMesaRedonda: fallbackMesa, decisionVerdicts: fallbackVerdicts };
  }
}

export async function generateGameTwistNarrative(
  twistPrompt: string,
  homeTeam: string,
  awayTeam: string,
  score: string,
  minute: number,
  apiKey?: string
): Promise<{ narration: string; temperatureDelta: number }> {
  const fallback = {
    narration: `REVIRAVOLTA DRAMÁTICA (${minute}'): ${twistPrompt}! O clima no estádio ferve e os ânimos se exaltam em campo!`,
    temperatureDelta: 25
  };

  if (!apiKey || !apiKey.trim()) return fallback;

  const prompt = `Narrador esportivo. Jogo: ${homeTeam} ${score} ${awayTeam} (${minute} min).
Reviravolta: "${twistPrompt}". Crie narração jornalística de impacto imediato (máximo 18 palavras).`;

  const res = await requestGemini(prompt, apiKey);
  return {
    narration: res ? `${minute}' - ⚡ ${res.trim().replace(/^"|"$/g, '')}` : fallback.narration,
    temperatureDelta: 25
  };
}

export async function generatePreMatchStoryline(
  home: Team,
  away: Team,
  tier: string,
  refereeName: string,
  apiKey?: string
): Promise<PreMatchStoryline> {
  const fallback: PreMatchStoryline = {
    pressHeadline: `DECISÃO EM ${home.stadiumName.toUpperCase()}: ${home.name} e ${away.name} duelam sob olhar atento da arbitragem!`,
    homeManagerQuote: `"${home.managerName}: 'Confiamos na comissão de arbitragem, mas vamos cobrar critério igual nos lances capitais.'"`,
    awayManagerQuote: `"${away.managerName}: 'Jogar fora de casa exige um árbitro com personalidade firme que não se dobre à torcida.'"`,
    scrutinyContext: `Partida classificada com alto nível de tensão. Árbitro ${refereeName} sob observação da comissão técnica.`
  };

  if (!apiKey || !apiKey.trim()) return fallback;

  const prompt = `Jornalismo esportivo cobrindo pré-jogo de ${home.name} x ${away.name} (${tier}) apitada por ${refereeName}.
Gere um JSON puro com:
"pressHeadline": manchete de impacto
"homeManagerQuote": frase do técnico ${home.managerName}
"awayManagerQuote": frase do técnico ${away.managerName}
"scrutinyContext": contexto de cobrança sobre o árbitro.`;

  const raw = await requestGemini(prompt, apiKey);
  if (!raw) return fallback;

  try {
    const text = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export async function generateMatchNarration(
  eventDescription: string,
  homeTeam: string,
  awayTeam: string,
  score: string,
  minute: number,
  apiKey?: string
): Promise<string> {
  if (!apiKey || !apiKey.trim()) return `${minute}' - ${eventDescription}`;

  const prompt = `Narrador dinâmico de futebol brasileiro. Jogo: ${homeTeam} ${score} ${awayTeam} (${minute} min).
Evento: "${eventDescription}". Crie narração curta e enérgica (máximo 15 palavras).`;

  const res = await requestGemini(prompt, apiKey);
  return res ? `${minute}' - ${res.trim()}` : `${minute}' - ${eventDescription}`;
}
