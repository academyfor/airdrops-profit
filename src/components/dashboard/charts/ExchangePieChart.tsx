import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ExchangeTotals, EXCHANGE_COLORS } from '@/types/dashboard';

interface ExchangePieChartProps {
  exchangeTotals: ExchangeTotals;
}

export function ExchangePieChart({ exchangeTotals }: ExchangePieChartProps) {
  const data = [
    { name: 'OKX', value: exchangeTotals.okx, color: EXCHANGE_COLORS.okx },
    { name: 'Bitget', value: exchangeTotals.bitget, color: EXCHANGE_COLORS.bitget },
    { name: 'MEXC', value: exchangeTotals.mexc, color: EXCHANGE_COLORS.mexc },
    { name: 'BingX', value: exchangeTotals.bingx, color: EXCHANGE_COLORS.bingx },
    { name: 'Bybit', value: exchangeTotals.bybit, color: EXCHANGE_COLORS.bybit },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / exchangeTotals.total) * 100).toFixed(1);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="ml-2 font-medium text-primary">
              ${data.value.toFixed(0)}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Share:</span>
            <span className="ml-2 font-medium text-accent">
              {percentage}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle>Exchange Contribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}