import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MemberEarning, FilterState } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface MemberEarningsTableProps {
  members: MemberEarning[];
  filters: FilterState;
}

export function MemberEarningsTable({ members, filters }: MemberEarningsTableProps) {
  const filteredMembers = members.filter(member => {
    // Search filter
    if (filters.searchTerm && !member.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }

    // Referral filter
    if (!filters.showReferrals && member.isReferral) {
      return false;
    }

    return true;
  });

  const totals = {
    okx: filteredMembers.reduce((sum, m) => sum + (m.okx || 0), 0),
    bitget: filteredMembers.reduce((sum, m) => sum + (m.bitget || 0), 0),
    mexc: filteredMembers.reduce((sum, m) => sum + (m.mexc || 0), 0),
    bingx: filteredMembers.reduce((sum, m) => sum + (m.bingx || 0), 0),
    bybit: filteredMembers.reduce((sum, m) => sum + (m.bybit || 0), 0),
  };
  const grandTotal = totals.okx + totals.bitget + totals.mexc + totals.bingx + totals.bybit;

  const formatValue = (value: number | null) => {
    if (value === null) return <span className="text-muted-foreground">~</span>;
    if (value === 0) return <span className="text-muted-foreground">X</span>;
    
    const color = value > 0 ? 'text-crypto-green' : 'text-crypto-red';
    return (
      <span className={cn('font-medium', color)}>
        ${Math.abs(value).toFixed(0)}
      </span>
    );
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Member Earnings Breakdown</span>
          <Badge variant="outline" className="text-xs">
            {filteredMembers.length} members
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-foreground font-semibold">Name</TableHead>
                <TableHead className="text-center text-exchange-okx font-semibold">OKX</TableHead>
                <TableHead className="text-center text-exchange-bitget font-semibold">Bitget</TableHead>
                <TableHead className="text-center text-exchange-mexc font-semibold">MEXC</TableHead>
                <TableHead className="text-center text-exchange-bingx font-semibold">BingX</TableHead>
                <TableHead className="text-center text-exchange-bybit font-semibold">Bybit</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member, index) => (
                <TableRow 
                  key={index} 
                  className={cn(
                    'border-border hover:bg-muted/50 transition-colors',
                    member.isReferral && 'opacity-75'
                  )}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {member.name}
                      {member.isReferral && (
                        <Badge variant="secondary" className="text-xs">
                          REF
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{formatValue(member.okx)}</TableCell>
                  <TableCell className="text-center">{formatValue(member.bitget)}</TableCell>
                  <TableCell className="text-center">{formatValue(member.mexc)}</TableCell>
                  <TableCell className="text-center">{formatValue(member.bingx)}</TableCell>
                  <TableCell className="text-center">{formatValue(member.bybit)}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      'font-bold',
                      member.total > 0 ? 'text-crypto-green' : 
                      member.total < 0 ? 'text-crypto-red' : 'text-muted-foreground'
                    )}>
                      ${member.total.toFixed(0)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              
              <TableRow className="border-t-2 border-primary/30 bg-muted/20 hover:bg-muted/30">
                <TableCell className="font-bold text-foreground">TOTALS</TableCell>
                <TableCell className="text-center font-bold text-exchange-okx">
                  ${totals.okx.toFixed(0)}
                </TableCell>
                <TableCell className="text-center font-bold text-exchange-bitget">
                  ${totals.bitget.toFixed(0)}
                </TableCell>
                <TableCell className="text-center font-bold text-exchange-mexc">
                  ${totals.mexc.toFixed(0)}
                </TableCell>
                <TableCell className="text-center font-bold text-exchange-bingx">
                  ${totals.bingx.toFixed(0)}
                </TableCell>
                <TableCell className="text-center font-bold text-exchange-bybit">
                  ${totals.bybit.toFixed(0)}
                </TableCell>
                <TableCell className="text-center font-bold text-primary text-lg">
                  ${grandTotal.toFixed(0)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}