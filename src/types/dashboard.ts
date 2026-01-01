export interface MemberEarning {
  name: string;
  okx: number | null;
  bitget: number | null;
  mexc: number | null;
  bingx: number | null;
  bybit: number | null;
  total: number;
  isReferral: boolean;
}

export interface MonthlyData {
  month: string;
  profit: number;
}

export interface VendorPayment {
  month: string;
  amount: number;
}

export interface ExchangeTotals {
  okx: number;
  bitget: number;
  mexc: number;
  bingx: number;
  bybit: number;
  total: number;
}

export interface DashboardData {
  members: MemberEarning[];
  monthlyProfits: MonthlyData[];
  vendorPayments: VendorPayment[];
  exchangeTotals: ExchangeTotals;
  globalTotal: number;
  netProfit: number;
  totalVendorSpend: number;
}

export interface FilterState {
  searchTerm: string;
  selectedExchanges: string[];
  includeZeros: boolean;
  includePotentials: boolean;
  showReferrals: boolean;
  selectedMembers: string[];
}

export const EXCHANGE_COLORS = {
  okx: 'hsl(var(--okx))',
  bitget: 'hsl(var(--bitget))',
  mexc: 'hsl(var(--mexc))',
  bingx: 'hsl(var(--bingx))',
  bybit: 'hsl(var(--bybit))',
} as const;

export const EXCHANGES = ['okx', 'bitget', 'mexc', 'bingx', 'bybit'] as const;
export type Exchange = typeof EXCHANGES[number];