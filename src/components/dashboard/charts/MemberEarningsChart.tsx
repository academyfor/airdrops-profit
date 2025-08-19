import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MemberEarning, EXCHANGE_COLORS } from '@/types/dashboard';

interface MemberEarningsChartProps {
  members: MemberEarning[];
  selectedMembers?: string[];
}

export function MemberEarningsChart({ members, selectedMembers }: MemberEarningsChartProps) {
  // Filter members if specific ones are selected
  const displayMembers = selectedMembers && selectedMembers.length > 0 
    ? members.filter(m => selectedMembers.includes(m.name))
    : members.filter(m => !m.isReferral && (m.okx !== null || m.bitget !== null || m.mexc !== null || m.bingx !== null)).slice(0, 10); // Top 10 active members

  const chartData = displayMembers.map(member => ({
    name: member.name.length > 10 ? member.name.substring(0, 10) + '...' : member.name,
    fullName: member.name,
    OKX: member.okx || 0,
    Bitget: member.bitget || 0,
    MEXC: member.mexc || 0,
    BingX: member.bingx || 0,
    total: member.total
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{data.fullName}</p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} className="text-sm">
              <span style={{ color: entry.color }}>{entry.dataKey}:</span>
              <span className="ml-2 font-medium">
                ${entry.value.toFixed(0)}
              </span>
            </p>
          ))}
          <div className="border-t border-border mt-2 pt-2">
            <p className="text-sm font-semibold text-primary">
              Total: ${data.total.toFixed(0)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle>
          {selectedMembers && selectedMembers.length > 0 
            ? 'Selected Members Earnings' 
            : 'Top Earners by Exchange'
          }
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="OKX" stackId="earnings" fill={EXCHANGE_COLORS.okx} name="OKX" />
              <Bar dataKey="Bitget" stackId="earnings" fill={EXCHANGE_COLORS.bitget} name="Bitget" />
              <Bar dataKey="MEXC" stackId="earnings" fill={EXCHANGE_COLORS.mexc} name="MEXC" />
              <Bar dataKey="BingX" stackId="earnings" fill={EXCHANGE_COLORS.bingx} name="BingX" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}