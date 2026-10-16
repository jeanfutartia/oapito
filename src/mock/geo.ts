// Cidades do jogo (coordenadas aproximadas) e a cidade de cada clube. Usado para calcular km e custo de viagem.
export interface City { name: string; uf: string; lat: number; lon: number }

export const CITIES: Record<string, City> = {
  'sao-paulo': { name: 'São Paulo', uf: 'SP', lat: -23.55, lon: -46.63 },
  'rio': { name: 'Rio de Janeiro', uf: 'RJ', lat: -22.91, lon: -43.17 },
  'belo-horizonte': { name: 'Belo Horizonte', uf: 'MG', lat: -19.92, lon: -43.94 },
  'brasilia': { name: 'Brasília', uf: 'DF', lat: -15.79, lon: -47.88 },
  'curitiba': { name: 'Curitiba', uf: 'PR', lat: -25.43, lon: -49.27 },
  'porto-alegre': { name: 'Porto Alegre', uf: 'RS', lat: -30.03, lon: -51.22 },
  'florianopolis': { name: 'Florianópolis', uf: 'SC', lat: -27.6, lon: -48.55 },
  'salvador': { name: 'Salvador', uf: 'BA', lat: -12.97, lon: -38.5 },
  'recife': { name: 'Recife', uf: 'PE', lat: -8.05, lon: -34.9 },
  'fortaleza': { name: 'Fortaleza', uf: 'CE', lat: -3.73, lon: -38.52 },
  'natal': { name: 'Natal', uf: 'RN', lat: -5.79, lon: -35.21 },
  'joao-pessoa': { name: 'João Pessoa', uf: 'PB', lat: -7.12, lon: -34.86 },
  'maceio': { name: 'Maceió', uf: 'AL', lat: -9.67, lon: -35.74 },
  'aracaju': { name: 'Aracaju', uf: 'SE', lat: -10.91, lon: -37.07 },
  'sao-luis': { name: 'São Luís', uf: 'MA', lat: -2.53, lon: -44.3 },
  'teresina': { name: 'Teresina', uf: 'PI', lat: -5.09, lon: -42.8 },
  'belem': { name: 'Belém', uf: 'PA', lat: -1.46, lon: -48.5 },
  'manaus': { name: 'Manaus', uf: 'AM', lat: -3.12, lon: -60.02 },
  'goiania': { name: 'Goiânia', uf: 'GO', lat: -16.68, lon: -49.25 },
  'cuiaba': { name: 'Cuiabá', uf: 'MT', lat: -15.6, lon: -56.1 },
  'campo-grande': { name: 'Campo Grande', uf: 'MS', lat: -20.47, lon: -54.62 },
  'vitoria': { name: 'Vitória', uf: 'ES', lat: -20.32, lon: -40.34 },
  'campinas': { name: 'Campinas', uf: 'SP', lat: -22.91, lon: -47.06 },
  'ribeirao-preto': { name: 'Ribeirão Preto', uf: 'SP', lat: -21.18, lon: -47.81 },
  'santos': { name: 'Santos', uf: 'SP', lat: -23.96, lon: -46.33 },
  'araraquara': { name: 'Araraquara', uf: 'SP', lat: -21.79, lon: -48.18 },
  'itu': { name: 'Itu', uf: 'SP', lat: -23.26, lon: -47.3 },
  'novo-horizonte': { name: 'Novo Horizonte', uf: 'SP', lat: -21.46, lon: -49.22 },
  'maringa': { name: 'Maringá', uf: 'PR', lat: -23.42, lon: -51.94 },
  'londrina': { name: 'Londrina', uf: 'PR', lat: -23.31, lon: -51.16 },
  'ponta-grossa': { name: 'Ponta Grossa', uf: 'PR', lat: -25.09, lon: -50.16 },
  'joinville': { name: 'Joinville', uf: 'SC', lat: -26.3, lon: -48.85 },
  'brusque': { name: 'Brusque', uf: 'SC', lat: -27.1, lon: -48.92 },
  'criciuma': { name: 'Criciúma', uf: 'SC', lat: -28.68, lon: -49.37 },
  'chapeco': { name: 'Chapecó', uf: 'SC', lat: -27.1, lon: -52.62 },
  'caxias-do-sul': { name: 'Caxias do Sul', uf: 'RS', lat: -29.17, lon: -51.18 },
  'campina-grande': { name: 'Campina Grande', uf: 'PB', lat: -7.23, lon: -35.88 },
  'camaragibe': { name: 'Camaragibe', uf: 'PE', lat: -8.02, lon: -34.98 },
  'tombos': { name: 'Tombos', uf: 'MG', lat: -20.91, lon: -42.0 },
  'sao-joao-del-rei': { name: 'São João del-Rei', uf: 'MG', lat: -21.14, lon: -44.26 },
  'volta-redonda': { name: 'Volta Redonda', uf: 'RJ', lat: -22.52, lon: -44.1 },
  'aparecida-de-goiania': { name: 'Aparecida de Goiânia', uf: 'GO', lat: -16.82, lon: -49.24 },
  'horizonte': { name: 'Horizonte', uf: 'CE', lat: -4.1, lon: -38.49 }
};

export const TEAM_CITY: Record<string, string> = {
  d1: 'recife', d2: 'campina-grande', d3: 'araraquara', d4: 'maringa', d5: 'itu', d6: 'caxias-do-sul', d7: 'tombos', d8: 'manaus',
  d9: 'camaragibe', d10: 'natal', d11: 'joinville', d12: 'aparecida-de-goiania',
  c1: 'campinas', c2: 'florianopolis', c3: 'londrina', c4: 'recife', c5: 'belem', c6: 'ribeirao-preto', c7: 'volta-redonda', c8: 'aracaju',
  c9: 'maceio', c10: 'brusque', c11: 'sao-joao-del-rei', c12: 'horizonte',
  b1: 'recife', b2: 'curitiba', b3: 'goiania', b4: 'florianopolis', b5: 'goiania', b6: 'fortaleza', b7: 'caxias-do-sul', b8: 'criciuma',
  b9: 'chapeco', b10: 'ponta-grossa', b11: 'novo-horizonte', b12: 'belem',
  a1: 'rio', a2: 'rio', a3: 'sao-paulo', a4: 'rio', a5: 'sao-paulo', a6: 'sao-paulo', a7: 'santos', a8: 'porto-alegre', a9: 'porto-alegre',
  a10: 'belo-horizonte', a11: 'belo-horizonte', a12: 'rio'
};

export const DEFAULT_CITY = 'sao-paulo';
export const cityLabel = (key: string | undefined): string => { const c = CITIES[key ?? DEFAULT_CITY] ?? CITIES[DEFAULT_CITY]; return c.name + ' - ' + c.uf; };
export const CITY_OPTIONS: { key: string; label: string }[] = Object.keys(CITIES)
  .map(k => ({ key: k, label: cityLabel(k) }))
  .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

const rad = (d: number) => (d * Math.PI) / 180;
function airKm(a: City, b: City): number {
  const dLat = rad(b.lat - a.lat); const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export type TravelMode = 'LOCAL' | 'CARRO' | 'AVIAO';
export interface TravelInfo { km: number; cost: number; mode: TravelMode; from: string; to: string }

// Distância por estrada (+22% sobre a linha reta) para viagens de carro; avião usa a linha reta.
export function travelBetween(fromKey: string | undefined, teamId: string): TravelInfo {
  const from = CITIES[fromKey ?? DEFAULT_CITY] ?? CITIES[DEFAULT_CITY];
  const to = CITIES[TEAM_CITY[teamId] ?? DEFAULT_CITY] ?? CITIES[DEFAULT_CITY];
  const air = airKm(from, to);
  if (air < 15) return { km: Math.round(air), cost: 30, mode: 'LOCAL', from: cityLabel(fromKey), to: cityLabel(TEAM_CITY[teamId]) };
  const road = air * 1.22;
  if (road <= 450) return { km: Math.round(road), cost: Math.round((road * 0.35) / 10) * 10, mode: 'CARRO', from: cityLabel(fromKey), to: cityLabel(TEAM_CITY[teamId]) };
  return { km: Math.round(air), cost: Math.round((90 + air * 0.07) / 10) * 10, mode: 'AVIAO', from: cityLabel(fromKey), to: cityLabel(TEAM_CITY[teamId]) };
}
export const MODE_LABEL: Record<TravelMode, string> = { LOCAL: '🏠 na sua cidade', CARRO: '🚗 de carro', AVIAO: '✈️ de avião' };
