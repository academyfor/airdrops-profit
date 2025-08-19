import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'primary' | 'success' | 'danger';
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val);
    }
    return val;
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-crypto-green';
      case 'down': return 'text-crypto-red';
      default: return 'text-muted-foreground';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 crypto-glow';
      case 'success':
        return 'bg-gradient-to-br from-crypto-green/20 to-crypto-green/5 border-crypto-green/30';
      case 'danger':
        return 'bg-gradient-to-br from-crypto-red/20 to-crypto-red/5 border-crypto-red/30';
      default:
        return 'card-gradient';
    }
  };

  return (
    <Card className={cn(
      'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
      getVariantStyles(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn(
            'h-4 w-4',
            variant === 'primary' ? 'text-primary' :
            variant === 'success' ? 'text-crypto-green' :
            variant === 'danger' ? 'text-crypto-red' :
            'text-muted-foreground'
          )} />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {formatValue(value)}
        </div>
        {subtitle && (
          <p className={cn('text-xs', getTrendColor())}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}