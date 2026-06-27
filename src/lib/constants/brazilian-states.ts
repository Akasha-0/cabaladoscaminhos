/**
 * Brazilian States — Constants
 * ----------------------------------------------------------------------------
 * Lista de UFs (sigla + nome) para uso em selects/autocomplete de
 * local de nascimento. Mantém o padrão usado no `OnboardingWizard`
 * para não duplicar.
 *
 * @module constants/brazilian-states
 */

export interface BrazilianState {
  value: string; // UF (2 chars)
  label: string; // Nome completo
}

export const BRAZILIAN_STATES: ReadonlyArray<BrazilianState> = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

/**
 * Capitais brasileiras (curto) — alimenta o autocomplete simples de cidade.
 */
export const BRAZILIAN_CAPITALS: ReadonlyArray<string> = [
  'Aracaju',
  'Belém',
  'Belo Horizonte',
  'Boa Vista',
  'Brasília',
  'Campo Grande',
  'Cuiabá',
  'Curitiba',
  'Florianópolis',
  'Fortaleza',
  'Goiânia',
  'João Pessoa',
  'Macapá',
  'Maceió',
  'Manaus',
  'Natal',
  'Palmas',
  'Porto Alegre',
  'Porto Velho',
  'Recife',
  'Rio Branco',
  'Rio de Janeiro',
  'Salvador',
  'São Luís',
  'São Paulo',
  'Teresina',
  'Vitória',
];

/**
 * Capitais + outras cidades grandes (autocomplete curto).
 */
export const BRAZILIAN_CITIES_SUGGESTIONS: ReadonlyArray<string> = [
  ...BRAZILIAN_CAPITALS,
  'Anápolis',
  'Aparecida de Goiânia',
  'Aracaju',
  'Barueri',
  'Bauru',
  'Blumenau',
  'Cabo Frio',
  'Camaçari',
  'Campinas',
  'Campos dos Goytacazes',
  'Caruaru',
  'Cascavel',
  'Caxias do Sul',
  'Contagem',
  'Diadema',
  'Duque de Caxias',
  'Feira de Santana',
  'Franca',
  'Guarujá',
  'Guarulhos',
  'Itabuna',
  'Jaboatão dos Guararapes',
  'Joinville',
  'Juiz de Fora',
  'Jundiaí',
  'Londrina',
  'Macaé',
  'Marília',
  'Maringá',
  'Mauá',
  'Mogi das Cruzes',
  'Montes Claros',
  'Mossoró',
  'Niterói',
  'Nova Iguaçu',
  'Olinda',
  'Osasco',
  'Paulista',
  'Pelotas',
  'Petrópolis',
  'Piracicaba',
  'Ponta Grossa',
  'Porto Seguro',
  'Praia Grande',
  'Presidente Prudente',
  'Ribeirão Preto',
  'Rio das Ostras',
  'Rio Verde',
  'Santo André',
  'Santos',
  'São Bernardo do Campo',
  'São Caetano do Sul',
  'São Gonçalo',
  'São José do Rio Preto',
  'São José dos Campos',
  'São Vicente',
  'Sorocaba',
  'Suzano',
  'Taubaté',
  'Uberaba',
  'Uberlândia',
  'Vitória da Conquista',
  'Volta Redonda',
];

/**
 * Filtra sugestões de cidade a partir de um termo.
 * Busca case-insensitive, retorna até `max` itens.
 */
export function suggestCities(query: string, max = 6): string[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const matches: Array<{ city: string; score: number }> = [];

  for (const city of BRAZILIAN_CITIES_SUGGESTIONS) {
    const lower = city.toLowerCase();
    if (lower.startsWith(q)) {
      matches.push({ city, score: 100 - (lower.length - q.length) });
    } else if (lower.includes(q)) {
      matches.push({ city, score: 50 - (lower.length - q.length) });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, max).map((m) => m.city);
}