import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VendorPayment } from '@/types/dashboard';
import { TrendingDown, DollarSign, Percent } from 'lucide-react';

interface VendorSectionProps {
  vendorPayments: VendorPayment[];
  totalIncome: number;
  vendorInvestment?: number;
}

export function VendorSection({ vendorPayments, totalIncome, vendorInvestment = 315 }: VendorSectionProps) {
  const totalPaid = vendorPayments.reduce((sum, payment) => {
    return payment.month === 'Initial Investment' ? sum : sum + payment.amount;
  }, 0);
  const vendorSpendPercentage = totalIncome > 0 ? (totalPaid / totalIncome) * 100 : 0;
  const profitMargin = totalPaid;
  const isProfitable = profitMargin > 0;

  return (
    <div className="space-y-6">
      {/* Vendor KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-gradient">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-crypto-red/20">
                <DollarSign className="h-5 w-5 text-crypto-red" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-foreground">${totalPaid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <TrendingDown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Investment</p>
                <p className="text-2xl font-bold text-foreground">${vendorInvestment}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isProfitable ? 'bg-crypto-green/20' : 'bg-crypto-red/20'}`}>
                <DollarSign className={`h-5 w-5 ${isProfitable ? 'text-crypto-green' : 'text-crypto-red'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendor Profit</p>
                <p className={`text-2xl font-bold ${isProfitable ? 'text-crypto-green' : 'text-crypto-red'}`}>
                  ${Math.abs(profitMargin)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isProfitable ? 'Profit' : 'Loss'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Percent className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost Ratio</p>
                <p className="text-2xl font-bold text-foreground">{vendorSpendPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">of total income</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Payments Table */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Vendor Payment History</span>
            <Badge variant={isProfitable ? "default" : "destructive"}>
              {isProfitable ? `+$${profitMargin} Profit` : `-$${Math.abs(profitMargin)} Loss`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Payment Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profit Distribution</span>
                <span className="text-foreground font-medium">
                  ${totalIncome + totalPaid} total profit (${totalIncome} your earning + ${totalPaid} vendor profit)
                </span>
              </div>
              <Progress 
                value={((totalPaid - vendorInvestment) / totalPaid) * 100} 
                className="h-2" 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Safe Investment: ${vendorInvestment}</span>
                <span className="text-crypto-green">
                  Profit: ${totalPaid - vendorInvestment}
                </span>
              </div>
            </div>

            {/* Payments Table */}
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-foreground font-semibold">Description</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Amount</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Type</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorPayments.map((payment, index) => {
                  const isInvestment = payment.month === 'Initial Investment';
                  const isProfit = !isInvestment;
                  
                  return (
                    <TableRow key={index} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium">{payment.month}</TableCell>
                      <TableCell className="text-center font-semibold">
                        <span className={isInvestment ? 'text-primary' : 'text-crypto-green'}>
                          ${payment.amount}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        <Badge variant={isInvestment ? "secondary" : "default"} className="text-xs">
                          {isInvestment ? 'Safe Investment' : 'Profit'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={isInvestment ? "outline" : "default"}
                          className="text-xs"
                        >
                          {isInvestment ? 'Returnable' : 'Earned'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}