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

// Convert Google Sheets data to dashboard format
export function convertSheetsToMemberEarnings(sheetMembers: SheetMember[]): MemberEarning[] {
  return sheetMembers.map(member => ({
    name: member.name,
    okx: member.okx,
    bitget: member.bitget,
    mexc: member.mexc,
    bingx: member.bingx,
    total: member.total || calculateMemberTotal({
      name: member.name,
      okx: member.okx,
      bitget: member.bitget,
      mexc: member.mexc,
      bingx: member.bingx,
      total: 0,
      isReferral: false
    }),
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

// Convert dashboard data back to Google Sheets format
export function convertMemberEarningsToSheets(members: MemberEarning[]): SheetMember[] {
  return members.map(member => ({
    name: member.name,
    okx: member.okx || 0,
    bitget: member.bitget || 0,
    mexc: member.mexc || 0,
    bingx: member.bingx || 0,
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
  
  // Calculate totals for each member
  members.forEach(member => {
    member.total = calculateMemberTotal(member);
  });
  
  // Generate mock vendor payments since they're not in sheets yet
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

// Data based on the actual Google Sheets CSV file
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