import { useState, useMemo, useEffect } from 'react';
import { FilterState, DashboardData } from '@/types/dashboard';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { GoogleSheetsSync } from './GoogleSheetsSync';
import { convertSheetsToDashboardData } from '@/utils/dataParser';
import { KPICard } from './KPICard';
import { MemberEarningsTable } from './MemberEarningsTable';
import { DashboardFilters } from './DashboardFilters';
import { MemberEarningsChart } from './charts/MemberEarningsChart';
import { ExchangePieChart } from './charts/ExchangePieChart';
import { MonthlyProfitChart } from './charts/MonthlyProfitChart';
import { VendorSection } from './VendorSection';
import { AIInsights } from './AIInsights';
import { IncomeComparison } from './IncomeComparison';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  PiggyBank,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Receipt,
  Settings,
  TrendingDown
} from 'lucide-react';

interface CryptoDashboardProps {
  data: DashboardData;
}

export function CryptoDashboard({ data: initialData }: CryptoDashboardProps) {
  const googleSheets = useGoogleSheets();
  const [data, setData] = useState<DashboardData>(() => {
    // Try to load persisted data from localStorage
    const persistedData = localStorage.getItem('cryptoDashboardData');
    if (persistedData) {
      try {
        return JSON.parse(persistedData);
      } catch (error) {
        console.error('Error parsing persisted data:', error);
      }
    }
    return initialData;
  });
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedExchanges: [],
    includeZeros: true,
    includePotentials: true,
    showReferrals: true,
    selectedMembers: [],
  });

  // Update data when Google Sheets data is fetched
  const handleFetchData = () => {
    if (googleSheets.sheetsData) {
      const newData = convertSheetsToDashboardData(googleSheets.sheetsData);
      setData(newData);
      // Persist data to localStorage
      localStorage.setItem('cryptoDashboardData', JSON.stringify(newData));
    }
  };

  const handlePushData = () => {
    // Data is successfully pushed to Google Sheets
    // Could add additional logic here if needed
  };

  const memberNames = useMemo(() => 
    data.members.map(m => m.name), 
    [data.members]
  );

  const filteredData = useMemo(() => {
    let filteredMembers = [...data.members];

    // Apply filters
    if (filters.searchTerm) {
      filteredMembers = filteredMembers.filter(m => 
        m.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    if (!filters.showReferrals) {
      filteredMembers = filteredMembers.filter(m => !m.isReferral);
    }

    if (!filters.includeZeros) {
      filteredMembers = filteredMembers.filter(m => 
        ![m.okx, m.bitget, m.mexc, m.bingx].some(val => val === 0)
      );
    }

    if (!filters.includePotentials) {
      filteredMembers = filteredMembers.filter(m => 
        ![m.okx, m.bitget, m.mexc, m.bingx].some(val => val === null)
      );
    }

    return { ...data, members: filteredMembers };
  }, [data, filters]);

  // Calculate total income from income comparison data
  const totalIncomeFromComparison = useMemo(() => {
    const incomeData = googleSheets.sheetsData?.incomeData || [
      { month: 'May 2025', myProfit: 96, vendorProfit: 0 },
      { month: 'June 2025', myProfit: 200, vendorProfit: 123 },
      { month: 'July 2025', myProfit: 189, vendorProfit: 216 },
      { month: 'August 2025', myProfit: 60, vendorProfit: 105 }
    ];
    
    const totalMyIncome = incomeData.reduce((sum, item) => sum + item.myProfit, 0);
    const totalVendorIncome = incomeData.reduce((sum, item) => sum + item.vendorProfit, 0);
    
    return totalMyIncome + totalVendorIncome;
  }, [googleSheets.sheetsData?.incomeData]);

  // Calculate my total income for Net Profit display
  const myTotalIncome = useMemo(() => {
    const incomeData = googleSheets.sheetsData?.incomeData || [
      { month: 'May 2025', myProfit: 96, vendorProfit: 0 },
      { month: 'June 2025', myProfit: 200, vendorProfit: 123 },
      { month: 'July 2025', myProfit: 189, vendorProfit: 216 },
      { month: 'August 2025', myProfit: 60, vendorProfit: 105 }
    ];
    
    return incomeData.reduce((sum, item) => sum + item.myProfit, 0);
  }, [googleSheets.sheetsData?.incomeData]);

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Airdrops Income Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Track earnings, analyze performance, and monitor vendor relationships
        </p>
        {/* Total Project Profit Summary */}
        <div className="mt-4 p-4 rounded-lg card-gradient border border-primary/30">
          <p className="text-sm text-muted-foreground mb-1">Total Project Profit</p>
          <p className="text-3xl font-bold text-crypto-green">
            ${totalIncomeFromComparison.toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground">
            My Income + Vendor Income = Combined Success
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard
          title="Total In-Eligible Accounts"
          value={googleSheets.sheetsData?.totalInEligibleAccounts || 50}
          icon={TrendingDown}
          variant="primary"
          subtitle="Across all exchanges"
          showCurrency={false}
        />
        <KPICard
          title="OKX Earnings"
          value={data.exchangeTotals.okx}
          icon={TrendingUp}
          trend={data.exchangeTotals.okx > 0 ? 'up' : 'neutral'}
        />
        <KPICard
          title="Bitget Earnings"
          value={data.exchangeTotals.bitget}
          icon={TrendingUp}
          trend={data.exchangeTotals.bitget > 0 ? 'up' : data.exchangeTotals.bitget < 0 ? 'down' : 'neutral'}
        />
        <KPICard
          title="MEXC Earnings"
          value={data.exchangeTotals.mexc}
          icon={TrendingUp}
          trend={data.exchangeTotals.mexc > 0 ? 'up' : 'neutral'}
        />
        <KPICard
          title="BingX Earnings"
          value={data.exchangeTotals.bingx}
          icon={TrendingUp}
          trend={data.exchangeTotals.bingx > 0 ? 'up' : 'neutral'}
        />
        <KPICard
          title="Net Profit"
          value={myTotalIncome}
          icon={PiggyBank}
          variant={myTotalIncome > 0 ? 'success' : 'danger'}
          subtitle={`My total income`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <DashboardFilters
            filters={filters}
            onFiltersChange={setFilters}
            memberNames={memberNames}
          />
        </div>

        {/* Charts and Tables */}
        <div className="lg:col-span-3 space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <BarChart3 className="h-5 w-5 text-primary" />
                Member Performance
              </div>
              <MemberEarningsChart 
                members={filteredData.members}
                selectedMembers={filters.selectedMembers}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <PieChart className="h-5 w-5 text-accent" />
                Exchange Distribution
              </div>
              <ExchangePieChart exchangeTotals={data.exchangeTotals} />
            </div>
          </div>

          {/* Member Earnings Table */}
          <MemberEarningsTable 
            members={filteredData.members}
            filters={filters}
          />
        </div>
      </div>

      {/* Income Comparison - Always show with data */}
      <div className="space-y-4">
        <IncomeComparison incomeData={googleSheets.sheetsData?.incomeData || [
          { month: 'May 2025', myProfit: 96, vendorProfit: 0 },
          { month: 'June 2025', myProfit: 200, vendorProfit: 123 },
          { month: 'July 2025', myProfit: 189, vendorProfit: 216 },
          { month: 'August 2025', myProfit: 60, vendorProfit: 105 }
        ]} />
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Brain className="h-5 w-5 text-primary" />
          AI-Powered Insights
        </div>
        <AIInsights 
          members={data.members}
          monthlyProfits={data.monthlyProfits}
          vendorPayments={data.vendorPayments}
          totalIncome={data.globalTotal}
        />
      </div>

      {/* SheetDB Integration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Settings className="h-5 w-5 text-primary" />
          SheetDB Integration
        </div>
        <GoogleSheetsSync 
          googleSheets={googleSheets}
          onFetchData={handleFetchData}
          onPushData={handlePushData}
          dashboardData={{
            members: data.members,
            monthlyData: data.monthlyProfits
          }}
        />
      </div>
    </div>
  );
}