import { MemberEarning, MonthlyData, VendorPayment, DashboardData, ExchangeTotals } from '@/types/dashboard';
import { AllSheetData, SheetMember, SheetMonthlyData } from '@/services/googleSheetsService';

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
  const values = [member.okx, member.bitget, member.mexc, member.bingx, member.bybit];
  return values.reduce((sum, val) => sum + (val || 0), 0);
}

export function calculateExchangeTotals(members: MemberEarning[]): ExchangeTotals {
  const totals = {
    okx: 0,
    bitget: 0,
    mexc: 0,
    bingx: 0,
    bybit: 0,
    total: 0
  };

  members.forEach(member => {
    totals.okx += member.okx || 0;
    totals.bitget += member.bitget || 0;
    totals.mexc += member.mexc || 0;
    totals.bingx += member.bingx || 0;
    totals.bybit += member.bybit || 0;
  });

  totals.total = totals.okx + totals.bitget + totals.mexc + totals.bingx + totals.bybit;
  return totals;
}

export function convertSheetsToMemberEarnings(sheetMembers: SheetMember[]): MemberEarning[] {
  return sheetMembers.map(member => ({
    name: member.name,
    okx: member.okx,
    bitget: member.bitget,
    mexc: member.mexc,
    bingx: member.bingx,
    bybit: member.bybit,
    total: member.total,
    isReferral: member.name.toLowerCase().includes('referral')
  }));
}

// Convert Google Sheets monthly data to dashboard format
export function convertSheetsToMonthlyData(sheetMonthlyData: SheetMonthlyData[]): MonthlyData[] {
  return sheetMonthlyData.map(data => ({
    month: data.month,
    profit: data.profit
  }));
}

export function convertMemberEarningsToSheets(members: MemberEarning[]): SheetMember[] {
  return members.map(member => ({
    name: member.name,
    okx: member.okx,
    bitget: member.bitget,
    mexc: member.mexc,
    bingx: member.bingx,
    bybit: member.bybit,
    total: member.total
  }));
}

// Convert monthly data back to Google Sheets format
export function convertMonthlyDataToSheets(monthlyData: MonthlyData[]): SheetMonthlyData[] {
  return monthlyData.map(data => ({
    month: data.month,
    profit: data.profit,
    members: 0 // Default value since MonthlyData doesn't have members property
  }));
}

// Convert Google Sheets data to full dashboard data
export function convertSheetsToDashboardData(sheetsData: AllSheetData): DashboardData {
  const members = convertSheetsToMemberEarnings(sheetsData.members || []);
  const monthlyProfits = convertSheetsToMonthlyData(sheetsData.monthlyData || []);
  
  // Calculate totals for each member (already calculated in sheets, but ensure accuracy)
  members.forEach(member => {
    member.total = calculateMemberTotal(member);
  });
  
  // Generate vendor payments based on your actual data
  const vendorPayments: VendorPayment[] = [
    { month: 'Initial Investment', amount: 310 },
    { month: 'June 2025', amount: 123 },
    { month: 'July 2025', amount: 216 },
    { month: 'August 2025', amount: 52 },
  ];

  const exchangeTotals = calculateExchangeTotals(members);
  const totalVendorSpend = vendorPayments.reduce((sum, payment) => sum + payment.amount, 0);
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

export function getMockData(): DashboardData {
  // Latest snapshot of member earnings (frozen, no longer fetched from sheet)
  const members: MemberEarning[] = [
    { name: 'Aneeq', okx: null, bitget: 15, mexc: -5, bingx: 13, bybit: 0, total: 23, isReferral: false },
    { name: 'Raza', okx: 33, bitget: 0, mexc: 27, bingx: 13, bybit: 0, total: 73, isReferral: false },
    { name: 'Raza Referral', okx: 13, bitget: 67, mexc: 92, bingx: 0, bybit: 0, total: 172, isReferral: true },
    { name: 'Dani', okx: 20, bitget: 12, mexc: 27, bingx: null, bybit: 0, total: 59, isReferral: false },
    { name: 'Qasim Referral', okx: 30, bitget: 48, mexc: 198, bingx: 0, bybit: null, total: 276, isReferral: true },
    { name: 'Mine', okx: 11, bitget: null, mexc: null, bingx: null, bybit: 30, total: 41, isReferral: false },
    { name: 'Sehven', okx: null, bitget: -9, mexc: 13, bingx: 7, bybit: 0, total: 11, isReferral: false },
    { name: 'Sehven Referral', okx: null, bitget: 0, mexc: 70, bingx: 0, bybit: null, total: 70, isReferral: true },
    { name: 'Qaisar', okx: 30, bitget: 17, mexc: 58, bingx: -4, bybit: 0, total: 101, isReferral: false },
    { name: 'Shah Fahad', okx: null, bitget: 0, mexc: 20, bingx: 12, bybit: 0, total: 32, isReferral: false },
    { name: 'Atshan', okx: null, bitget: 0, mexc: 35, bingx: 9, bybit: 0, total: 44, isReferral: false },
    { name: 'Saqib Referral', okx: 63, bitget: 20, mexc: null, bingx: null, bybit: null, total: 83, isReferral: true },
    { name: 'Zuheer Referral', okx: 30, bitget: 10, mexc: 166, bingx: 5, bybit: null, total: 211, isReferral: true },
    { name: 'Haji / Ali Ref', okx: 66, bitget: 184, mexc: null, bingx: 38, bybit: 67, total: 355, isReferral: true },
    { name: 'Naseeb Ali', okx: 32, bitget: 19, mexc: 32, bingx: null, bybit: 189, total: 272, isReferral: false },
    { name: 'Abid', okx: null, bitget: 0, mexc: 34, bingx: null, bybit: 0, total: 34, isReferral: false },
    { name: 'Asim Referral', okx: 0, bitget: 0, mexc: 33, bingx: 0, bybit: 0, total: 33, isReferral: true },
    { name: 'Ali Referral', okx: 0, bitget: 0, mexc: 65, bingx: 0, bybit: null, total: 65, isReferral: true },
    { name: 'Mamo', okx: 0, bitget: 0, mexc: -31, bingx: 0, bybit: null, total: -31, isReferral: false },
    { name: 'Naseem', okx: null, bitget: null, mexc: 52, bingx: null, bybit: null, total: 52, isReferral: false },
  ];

  // Calculate totals for each member
  members.forEach(member => {
    member.total = calculateMemberTotal(member);
  });

  // Monthly profits from the CSV
  const monthlyProfits: MonthlyData[] = [
    { month: 'May 2025', profit: 96 },
    { month: 'June 2025', profit: 200 },
    { month: 'July 2025', profit: 189 },
  ];

  // Vendor payments from the CSV (invested amount $310 plus monthly profits)
  const vendorPayments: VendorPayment[] = [
    { month: 'Initial Investment', amount: 310 }, // Invested amount from CSV
    { month: 'June 2025', amount: 123 }, // Monthly profit from CSV
    { month: 'July 2025', amount: 216 }, // Monthly profit from CSV
    { month: 'August 2025', amount: 52 }, // Monthly profit from CSV
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