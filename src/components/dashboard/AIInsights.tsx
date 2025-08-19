import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MemberEarning, MonthlyData, VendorPayment } from '@/types/dashboard';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign } from 'lucide-react';

interface AIInsightsProps {
  members: MemberEarning[];
  monthlyProfits: MonthlyData[];
  vendorPayments: VendorPayment[];
  totalIncome: number;
}

export function AIInsights({ members, monthlyProfits, vendorPayments, totalIncome }: AIInsightsProps) {
  // Generate insights
  const insights = generateInsights(members, monthlyProfits, vendorPayments, totalIncome);

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights & Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={`p-2 rounded-full ${insight.iconBg}`}>
                <insight.icon className={`h-4 w-4 ${insight.iconColor}`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{insight.title}</h4>
                  <Badge variant={insight.badgeVariant}>{insight.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                {insight.details && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    {insight.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        {detail}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function generateInsights(
  members: MemberEarning[], 
  monthlyProfits: MonthlyData[], 
  vendorPayments: VendorPayment[], 
  totalIncome: number
) {
  const insights = [];

  // Top earners analysis
  const topEarners = members
    .filter(m => m.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  if (topEarners.length > 0) {
    insights.push({
      icon: TrendingUp,
      iconColor: 'text-crypto-green',
      iconBg: 'bg-crypto-green/20',
      title: 'Top Performers',
      category: 'Performance',
      badgeVariant: 'default' as const,
      description: `${topEarners[0].name} leads with $${topEarners[0].total}, followed by ${topEarners[1]?.name} and ${topEarners[2]?.name}.`,
      details: topEarners.map(member => `${member.name}: $${member.total}`)
    });
  }

  // Negative earners analysis
  const negativeEarners = members.filter(m => m.total < 0);
  if (negativeEarners.length > 0) {
    const worstPerformer = negativeEarners.sort((a, b) => a.total - b.total)[0];
    insights.push({
      icon: TrendingDown,
      iconColor: 'text-crypto-red',
      iconBg: 'bg-crypto-red/20',
      title: 'Loss Makers',
      category: 'Risk',
      badgeVariant: 'destructive' as const,
      description: `${negativeEarners.length} member(s) have negative earnings. ${worstPerformer.name} has the highest loss at $${Math.abs(worstPerformer.total)}.`,
      details: negativeEarners.map(member => `${member.name}: -$${Math.abs(member.total)}`)
    });
  }

  // Exchange performance
  const exchangeTotals = {
    okx: members.reduce((sum, m) => sum + (m.okx || 0), 0),
    bitget: members.reduce((sum, m) => sum + (m.bitget || 0), 0),
    mexc: members.reduce((sum, m) => sum + (m.mexc || 0), 0),
    bingx: members.reduce((sum, m) => sum + (m.bingx || 0), 0),
  };

  const bestExchange = Object.entries(exchangeTotals)
    .sort(([,a], [,b]) => b - a)[0];

  insights.push({
    icon: DollarSign,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/20',
    title: 'Exchange Leadership',
    category: 'Markets',
    badgeVariant: 'secondary' as const,
    description: `${bestExchange[0].toUpperCase()} is the top performing exchange with $${bestExchange[1]} total earnings.`,
    details: Object.entries(exchangeTotals)
      .sort(([,a], [,b]) => b - a)
      .map(([exchange, total]) => `${exchange.toUpperCase()}: $${total}`)
  });

  // Monthly trend analysis
  if (monthlyProfits.length >= 2) {
    const lastMonth = monthlyProfits[monthlyProfits.length - 1];
    const previousMonth = monthlyProfits[monthlyProfits.length - 2];
    const trend = lastMonth.profit > previousMonth.profit;
    const change = Math.abs(lastMonth.profit - previousMonth.profit);
    const changePercent = ((change / previousMonth.profit) * 100).toFixed(1);

    insights.push({
      icon: trend ? TrendingUp : TrendingDown,
      iconColor: trend ? 'text-crypto-green' : 'text-crypto-red',
      iconBg: trend ? 'bg-crypto-green/20' : 'bg-crypto-red/20',
      title: 'Monthly Trend',
      category: 'Trend',
      badgeVariant: trend ? 'default' : 'destructive' as const,
      description: `Monthly profit ${trend ? 'increased' : 'decreased'} by $${change} (${changePercent}%) from ${previousMonth.month} to ${lastMonth.month}.`,
      details: [`Previous: $${previousMonth.profit}`, `Current: $${lastMonth.profit}`]
    });
  }

  // Vendor analysis
  const totalVendorPaid = vendorPayments.reduce((sum, p) => sum + p.amount, 0);
  const vendorInvestment = 315;
  const vendorProfit = totalVendorPaid - vendorInvestment;
  const vendorRatio = (totalVendorPaid / totalIncome * 100).toFixed(1);

  insights.push({
    icon: vendorProfit > 0 ? TrendingUp : AlertTriangle,
    iconColor: vendorProfit > 0 ? 'text-crypto-green' : 'text-crypto-red',
    iconBg: vendorProfit > 0 ? 'bg-crypto-green/20' : 'bg-crypto-red/20',
    title: 'Vendor Status',
    category: 'Finance',
    badgeVariant: vendorProfit > 0 ? 'default' : 'destructive' as const,
    description: `Vendor has ${vendorProfit > 0 ? 'earned' : 'lost'} $${Math.abs(vendorProfit)} with ${vendorRatio}% cost ratio.`,
    details: [
      `Investment: $${vendorInvestment}`,
      `Paid: $${totalVendorPaid}`,
      `Status: ${vendorProfit > 0 ? 'Profitable' : 'In Recovery'}`
    ]
  });

  // Member activity insights
  const activeMembers = members.filter(m => m.total !== 0).length;
  const potentialMembers = members.filter(m => 
    [m.okx, m.bitget, m.mexc, m.bingx].some(val => val === null)
  ).length;

  insights.push({
    icon: Users,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/20',
    title: 'Team Activity',
    category: 'Team',
    badgeVariant: 'secondary' as const,
    description: `${activeMembers} active earners out of ${members.length} total members. ${potentialMembers} members have untapped potential.`,
    details: [
      `Active: ${activeMembers} members`,
      `Potential: ${potentialMembers} members`,
      `Referrals: ${members.filter(m => m.isReferral).length} members`
    ]
  });

  return insights;
}