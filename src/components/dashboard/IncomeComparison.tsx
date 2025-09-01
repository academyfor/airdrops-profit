import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, DollarSign, TrendingUp } from 'lucide-react';
import { IncomeData } from '@/services/googleSheetsService';

interface IncomeComparisonProps {
  incomeData: IncomeData[];
}

export function IncomeComparison({ incomeData }: IncomeComparisonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Show 3 months at a time, starting from the most recent
  const sortedData = [...incomeData].sort((a, b) => {
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Extract month and year from "Month Year" format
    const getMonthYear = (monthStr: string) => {
      const parts = monthStr.split(' ');
      const month = parts[0];
      const year = parseInt(parts[1] || '2025');
      return { month, year, order: monthOrder.indexOf(month) };
    };
    
    const aData = getMonthYear(a.month);
    const bData = getMonthYear(b.month);
    
    if (aData.year !== bData.year) {
      return bData.year - aData.year; // Most recent year first
    }
    return bData.order - aData.order; // Most recent month first
  });

  const displayData = sortedData.slice(currentIndex, currentIndex + 3);
  
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex + 3 < sortedData.length;

  const totalMyIncome = incomeData.reduce((sum, item) => sum + item.myProfit, 0);
  const totalVendorIncome = incomeData.reduce((sum, item) => sum + item.vendorProfit, 0);

  const handlePrevious = () => {
    if (canGoBack) {
      setCurrentIndex(currentIndex - 3);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      setCurrentIndex(currentIndex + 3);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              My Income vs Vendor Income
            </CardTitle>
            <CardDescription>
              Recent monthly comparison of income streams
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={!canGoBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={!canGoForward}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Monthly Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {displayData.map((item, index) => (
            <div key={item.month} className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-semibold text-sm text-muted-foreground mb-3">
                {item.month}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">My Income:</span>
                  <span className="font-semibold text-primary">
                    ${item.myProfit.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Vendor Income:</span>
                  <span className="font-semibold text-accent">
                    ${item.vendorProfit.toFixed(0)}
                  </span>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Difference:</span>
                    <span className={`font-semibold ${
                      item.myProfit >= item.vendorProfit ? 'text-green-500' : 'text-red-500'
                    }`}>
                      ${Math.abs(item.myProfit - item.vendorProfit).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Income Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Total My Income</h3>
            </div>
            <p className="text-2xl font-bold text-primary">
              ${totalMyIncome.toFixed(0)}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-accent">Total Vendor Income</h3>
            </div>
            <p className="text-2xl font-bold text-accent">
              ${totalVendorIncome.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Overall Performance */}
        <div className="mt-4 p-4 rounded-lg bg-muted/30 border">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Performance:</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-lg ${
                totalMyIncome >= totalVendorIncome ? 'text-green-500' : 'text-red-500'
              }`}>
                {totalMyIncome >= totalVendorIncome ? '+' : '-'}
                ${Math.abs(totalMyIncome - totalVendorIncome).toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({totalMyIncome >= totalVendorIncome ? 'Ahead' : 'Behind'})
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}