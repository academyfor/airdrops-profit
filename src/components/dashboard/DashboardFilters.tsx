import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FilterState, EXCHANGES } from '@/types/dashboard';
import { Search, Filter } from 'lucide-react';

interface DashboardFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  memberNames: string[];
}

export function DashboardFilters({ filters, onFiltersChange, memberNames }: DashboardFiltersProps) {
  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleExchangeToggle = (exchange: string, checked: boolean) => {
    const newExchanges = checked 
      ? [...filters.selectedExchanges, exchange]
      : filters.selectedExchanges.filter(e => e !== exchange);
    updateFilters({ selectedExchanges: newExchanges });
  };

  const handleMemberToggle = (member: string, checked: boolean) => {
    const newMembers = checked 
      ? [...filters.selectedMembers, member]
      : filters.selectedMembers.filter(m => m !== member);
    updateFilters({ selectedMembers: newMembers });
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Filters & Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-foreground font-medium">
            Search Members
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name..."
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="zeros" className="text-foreground font-medium">
              Include Zeros (X)
            </Label>
            <Switch
              id="zeros"
              checked={filters.includeZeros}
              onCheckedChange={(checked) => updateFilters({ includeZeros: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="potentials" className="text-foreground font-medium">
              Include Potentials (~)
            </Label>
            <Switch
              id="potentials"
              checked={filters.includePotentials}
              onCheckedChange={(checked) => updateFilters({ includePotentials: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="referrals" className="text-foreground font-medium">
              Show Referrals
            </Label>
            <Switch
              id="referrals"
              checked={filters.showReferrals}
              onCheckedChange={(checked) => updateFilters({ showReferrals: checked })}
            />
          </div>
        </div>

        {/* Exchange Filters */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">Exchanges</Label>
          <div className="grid grid-cols-2 gap-2">
            {EXCHANGES.map((exchange) => {
              const isSelected = filters.selectedExchanges.includes(exchange);
              return (
                <div key={exchange} className="flex items-center space-x-2">
                  <Checkbox
                    id={exchange}
                    checked={isSelected}
                    onCheckedChange={(checked) => 
                      handleExchangeToggle(exchange, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={exchange} 
                    className={`text-sm capitalize cursor-pointer text-exchange-${exchange}`}
                  >
                    {exchange.toUpperCase()}
                  </Label>
                </div>
              );
            })}
          </div>
          {filters.selectedExchanges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.selectedExchanges.map((exchange) => (
                <Badge key={exchange} variant="secondary" className="text-xs">
                  {exchange.toUpperCase()}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Selected Members Counter */}
        {filters.selectedMembers.length > 0 && (
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              Selected Members ({filters.selectedMembers.length})
            </Label>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {filters.selectedMembers.map((member) => (
                <Badge key={member} variant="outline" className="text-xs">
                  {member}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}