import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CarPerformance } from '@/hooks/usePerCarAnalytics';
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Settings
} from 'lucide-react';
import { useState } from 'react';

interface CarComparisonTableProps {
  carPerformanceData: CarPerformance[];
  onViewDetails?: (carId: string) => void;
  onManageStatus?: (carId: string) => void;
}

type SortField = keyof CarPerformance;
type SortDirection = 'asc' | 'desc';

export function CarComparisonTable({ 
  carPerformanceData, 
  onViewDetails, 
  onManageStatus 
}: CarComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('profitMargin');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...carPerformanceData].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle string comparisons
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // Handle numeric comparisons
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const getRecommendationBadge = (recommendation: CarPerformance['recommendation']) => {
    const variants = {
      keep_active: 'default',
      optimize: 'secondary',
      monitor: 'outline',
      return: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[recommendation]}>
        {recommendation.replace('_', ' ')}
      </Badge>
    );
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <SortableHeader field="profitMargin">Margin %</SortableHeader>
            <SortableHeader field="totalTrips">Trips</SortableHeader>
            <SortableHeader field="utilizationRate">Utilization</SortableHeader>
            <SortableHeader field="riskScore">Risk Score</SortableHeader>
            <SortableHeader field="recommendation">Recommendation</SortableHeader>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((car) => (
            <TableRow key={car.car_id}>
              <TableCell className="font-medium">
                <div>
                  <p className="font-semibold">{car.car_year} {car.car_make} {car.car_model}</p>
                  <p className="text-xs text-muted-foreground">
                    {car.activeDays} active days • Avg ${car.averagePerTrip.toFixed(0)}/trip
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span className={`font-medium ${
                  car.profitMargin >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {car.profitMargin.toFixed(1)}%
                </span>
              </TableCell>
              <TableCell>{car.totalTrips}</TableCell>
              <TableCell>
                <span className={`font-medium ${
                  car.utilizationRate >= 50 ? 'text-success' : 
                  car.utilizationRate >= 25 ? 'text-warning' : 'text-destructive'
                }`}>
                  {car.utilizationRate.toFixed(1)}%
                </span>
              </TableCell>
              <TableCell>
                <span className={`font-medium ${
                  car.riskScore < 30 ? 'text-success' :
                  car.riskScore < 60 ? 'text-warning' : 'text-destructive'
                }`}>
                  {car.riskScore.toFixed(0)}
                </span>
              </TableCell>
              <TableCell>
                {getRecommendationBadge(car.recommendation)}
              </TableCell>
              <TableCell>
                <Badge variant={car.car_status === 'available' ? 'default' : 'secondary'}>
                  {car.car_status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails?.(car.car_id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onManageStatus?.(car.car_id)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}