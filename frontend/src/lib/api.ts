const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface TopRankingItem {
  id: number;
  name: string;
  party: string;
  state: string;
  position: string;
  totalExpenses: number;
}

export interface TopRankingResponse {
  first: TopRankingItem | null;
  second: TopRankingItem | null;
  third: TopRankingItem | null;
}

export interface NationalRankingItem extends TopRankingItem {
  ranking: number;
}

export interface NationalRankingResponse {
  items: NationalRankingItem[];
  page: number;
  limit: number;
  total: number;
}

export interface PoliticianProfile {
  id: number;
  name: string;
  photoUrl: string;
  party: string;
  state: string;
  position: string;
  firstElectionDate: string | null;
  totalExpenses: number;
  monthlyAverage: number;
  nationalRanking: number;
  stateRanking: number;
  partyRanking: number;
}

export interface PoliticianExpenseItem {
  date: string;
  category: string;
  supplier: string;
  description: string;
  amount: number;
  documentUrl: string;
}

export interface PoliticianExpensesResponse {
  items: PoliticianExpenseItem[];
  page: number;
  limit: number;
  total: number;
}

export interface EvolutionData {
  monthly: Array<{ period: string; total: number }>;
  yearly: Array<{ period: string; total: number }>;
}

export interface SearchItem {
  id: number;
  name: string;
  party: string;
  state: string;
}

export interface SearchResponse {
  items: SearchItem[];
}

export interface StateItem {
  code: string;
  name: string;
}

export async function fetchTop3(): Promise<TopRankingResponse> {
  const res = await fetch(`${API_URL}/api/v1/rankings/top`, {
    next: { revalidate: 300 },
  });
  return res.json();
}

export async function fetchNationalRanking(
  params?: Record<string, string>,
): Promise<NationalRankingResponse> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_URL}/api/v1/rankings/national${qs}`, {
    next: { revalidate: 300 },
  });
  return res.json();
}

export async function fetchPolitician(id: number): Promise<PoliticianProfile> {
  const res = await fetch(`${API_URL}/api/v1/politicians/${id}`, {
    next: { revalidate: 300 },
  });
  return res.json();
}

export async function fetchPoliticianExpenses(
  id: number,
  params?: Record<string, string>,
): Promise<PoliticianExpensesResponse> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_URL}/api/v1/politicians/${id}/expenses${qs}`, {
    next: { revalidate: 300 },
  });
  return res.json();
}

export async function fetchSearch(q: string): Promise<SearchResponse> {
  const res = await fetch(`${API_URL}/api/v1/search?q=${encodeURIComponent(q)}`);
  return res.json();
}

export async function fetchStates(): Promise<StateItem[]> {
  const res = await fetch(`${API_URL}/api/v1/states`, {
    next: { revalidate: 3600 },
  });
  return res.json();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export { formatCurrency };
