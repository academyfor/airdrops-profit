import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { MonthlyData, VendorPayment } from '@/types/dashboard';

interface MonthlyProfitChartProps {
  monthlyProfits: MonthlyData[];
  vendorPayments: VendorPayment[];
  showComparison?: boolean;
}

export function MonthlyProfitChart({ monthlyProfits, vendorPayments, showComparison = false }: MonthlyProfitChartProps) {
  // Create all months from both datasets
  const allMonths = new Set([
    ...monthlyProfits.map(p => p.month),
    ...vendorPayments.map(v => v.month)
  ]);
  
  const combinedData = Array.from(allMonths).map(month => {
    const profit = monthlyProfits.find(p => p.month === month);
    const vendorPayment = vendorPayments.find(v => v.month === month);
    const myProfit = profit?.profit || 0;
    const vendorProfit = vendorPayment?.amount || 0;
    
    return {
      month: month.split(' ')[0], // Just the month name
      myProfit: myProfit,
      vendorProfit: vendorProfit,
      totalProfit: myProfit + vendorProfit
    };
  }).sort((a, b) => {
    const monthOrder = ['May', 'June', 'July', 'August'];
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} className="text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="ml-2 font-medium">
                ${entry.value.toFixed(0)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (showComparison) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>My Profit vs Vendor Profit Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="myProfit" fill="hsl(var(--crypto-green))" name="My Profit" />
                <Bar dataKey="vendorProfit" fill="hsl(var(--crypto-red))" name="Vendor Profit" />
                <Bar dataKey="totalProfit" fill="hsl(var(--primary))" name="Total Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle>Monthly Profit Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="myProfit" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                name="My Profit"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}