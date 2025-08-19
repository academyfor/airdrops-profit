import { MemberEarning, MonthlyData, VendorPayment, DashboardData, ExchangeTotals } from '@/types/dashboard';

export function parseValue(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null;
  
  const trimmed = value.trim();
  
  // Handle special cases
  if (trimmed === 'X') return 0; // Account exists but no earning
  if (trimmed === '~') return null; // Account not created yet (potential)
  
  // Parse monetary values
  const cleaned = trimmed.replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

export function calculateMemberTotal(member: MemberEarning): number {
  const values = [member.okx, member.bitget, member.mexc, member.bingx];
  return values.reduce((sum, val) => sum + (val || 0), 0);
}

export function calculateExchangeTotals(members: MemberEarning[]): ExchangeTotals {
  const totals = {
    okx: 0,
    bitget: 0,
    mexc: 0,
    bingx: 0,
    total: 0
  };

  members.forEach(member => {
    totals.okx += member.okx || 0;
    totals.bitget += member.bitget || 0;
    totals.mexc += member.mexc || 0;
    totals.bingx += member.bingx || 0;
  });

  totals.total = totals.okx + totals.bitget + totals.mexc + totals.bingx;
  return totals;
}

// Updated data based on actual spreadsheet image and user corrections
export function getMockData(): DashboardData {
  const members: MemberEarning[] = [
    { name: 'Aneeq', okx: null, bitget: 15, mexc: -5, bingx: 13, total: 0, isReferral: false },
    { name: 'Raza', okx: 33, bitget: 0, mexc: 27, bingx: 13, total: 0, isReferral: false },
    { name: 'Raza Referral', okx: 0, bitget: 0, mexc: 1, bingx: 0, total: 0, isReferral: true },
    { name: 'Dani', okx: 0, bitget: 0, mexc: 27, bingx: null, total: 0, isReferral: false },
    { name: 'Qasim Referral', okx: 0, bitget: 0, mexc: 104, bingx: 0, total: 0, isReferral: true },
    { name: 'Murtaza', okx: 11, bitget: null, mexc: null, bingx: null, total: 0, isReferral: false },
    { name: 'Sehven', okx: null, bitget: -18, mexc: 13, bingx: 7, total: 0, isReferral: false },
    { name: 'Sehven Referral', okx: null, bitget: 0, mexc: 26, bingx: 0, total: 0, isReferral: true },
    { name: 'Qaisar', okx: null, bitget: null, mexc: null, bingx: null, total: 0, isReferral: false },
    { name: 'Shah Fahad', okx: null, bitget: 0, mexc: 10, bingx: 12, total: 0, isReferral: false },
    { name: 'Atshan', okx: null, bitget: 0, mexc: 35, bingx: 9, total: 0, isReferral: false },
    { name: 'Zuheer', okx: null, bitget: null, mexc: 20, bingx: 7, total: 0, isReferral: false },
    { name: 'Zuheer Referral', okx: 0, bitget: 0, mexc: 50, bingx: 0, total: 0, isReferral: true },
    { name: 'Amir', okx: null, bitget: 0, mexc: 16, bingx: -2, total: 0, isReferral: false },
    { name: 'Naseeb Ali', okx: null, bitget: null, mexc: 16, bingx: null, total: 0, isReferral: false },
    { name: 'Abid', okx: null, bitget: 0, mexc: 14, bingx: null, total: 0, isReferral: false },
    { name: 'Asim Referral', okx: 0, bitget: 0, mexc: 33, bingx: 0, total: 0, isReferral: true },
    { name: 'Ali Referral', okx: 0, bitget: 0, mexc: 18, bingx: 0, total: 0, isReferral: true },
    { name: 'Mamo', okx: 0, bitget: 0, mexc: -31, bingx: 0, total: 0, isReferral: false },
    { name: 'Naseem', okx: null, bitget: null, mexc: 26, bingx: null, total: 0, isReferral: false },
  ];

  // Calculate totals for each member
  members.forEach(member => {
    member.total = calculateMemberTotal(member);
  });

  // Corrected monthly profits as per user data
  const monthlyProfits: MonthlyData[] = [
    { month: 'May 2025', profit: 96 },
    { month: 'June 2025', profit: 200 },
    { month: 'July 2025', profit: 189 },
  ];

  // Vendor payments - one-time investment plus monthly profits
  const vendorPayments: VendorPayment[] = [
    { month: 'Initial Investment', amount: 315 }, // One-time safe investment
    { month: 'June 2025', amount: 150 }, // Monthly profit
    { month: 'July 2025', amount: 180 }, // Monthly profit  
    { month: 'August 2025', amount: 61 }, // Monthly profit
  ];

  const exchangeTotals = calculateExchangeTotals(members);
  const totalVendorSpend = vendorPayments.reduce((sum, payment) => sum + payment.amount, 0);
  // Net profit should be same as total income (500$) as per user
  const netProfit = exchangeTotals.total;

  return {
    members,
    monthlyProfits,
    vendorPayments,
    exchangeTotals,
    globalTotal: exchangeTotals.total,
    netProfit,
    totalVendorSpend,
  };
}