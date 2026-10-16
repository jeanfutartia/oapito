// Salvar e carregar a carreira em arquivo (.json). Tudo local, sem conta e sem internet.
const KEY = 'o-apito-lastsave';

export interface SaveSummary { name: string; tier: string; season: number; seasonGame: number; matches: number; avg: number; savedAt: string | null }

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'arbitro';

export const TIER_NAME: Record<string, string> = { SERIE_D: 'Série D', SERIE_C: 'Série C', SERIE_B: 'Série B', SERIE_A: 'Série A', FIFA_INTERNACIONAL: 'Internacional' };

export function summarizeSave(json: string): SaveSummary | null {
  try {
    const o = JSON.parse(json) as { app?: string; savedAt?: string; state?: Record<string, unknown> };
    const st = o.state as { referee?: { name?: unknown; tier?: unknown; uefaAverageScore?: unknown; stats?: { matches?: unknown } }; season?: unknown; seasonGame?: unknown } | undefined;
    if (o.app !== 'o-apito' || !st || !st.referee || typeof st.referee.name !== 'string') return null;
    return {
      name: st.referee.name,
      tier: TIER_NAME[String(st.referee.tier)] ?? 'Série D',
      season: Number(st.season) || 1,
      seasonGame: Number(st.seasonGame) || 1,
      matches: Number(st.referee.stats?.matches) || 0,
      avg: Number(st.referee.uefaAverageScore) || 0,
      savedAt: typeof o.savedAt === 'string' ? o.savedAt : null
    };
  } catch { return null; }
}

export function saveFileName(json: string): string {
  const s = summarizeSave(json);
  const d = new Date();
  const stamp = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  return 'o-apito_' + slug(s?.name ?? 'carreira') + '_temp' + (s?.season ?? 1) + '-jogo' + (s?.seasonGame ?? 1) + '_' + stamp + '.json';
}

export function downloadSave(json: string): string {
  const name = saveFileName(json);
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return name;
}

export function markSaved(matches: number) {
  try { localStorage.setItem(KEY, JSON.stringify({ matches, at: Date.now() })); } catch { /* sem armazenamento */ }
}
export function lastSaved(): { matches: number; at: number } | null {
  try { const r = localStorage.getItem(KEY); return r ? (JSON.parse(r) as { matches: number; at: number }) : null; } catch { return null; }
}
export const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'data desconhecida');
