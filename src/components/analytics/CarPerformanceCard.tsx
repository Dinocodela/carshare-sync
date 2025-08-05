import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CarPerformance } from '@/hooks/usePerCarAnalytics';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Settings,
  Car
} from 'lucide-react';

interface CarPerformanceCardProps {
  performance: CarPerformance;
  onViewDetails?: (carId: string) => void;
  onManageStatus?: (carId: string) => void;
}

export function CarPerformanceCard({ 
  performance, 
  onViewDetails, 
  onManageStatus 
}: CarPerformanceCardProps) {
  const getRecommendationIcon = () => {
    switch (performance.recommendation) {
      case 'keep_active': return <CheckCircle className="h-4 w-4" />;
      case 'optimize': return <Settings className="h-4 w-4" />;
      case 'monitor': return <Eye className="h-4 w-4" />;
      case 'return': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = () => {
    switch (performance.recommendation) {
      case 'keep_active': return 'bg-emerald-500';
      case 'optimize': return 'bg-blue-500';
      case 'monitor': return 'bg-amber-500';
      case 'return': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = () => {
    if (performance.riskScore < 30) return 'text-emerald-600';
    if (performance.riskScore < 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${getRecommendationColor()}`} />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Car className="h-5 w-5 text-muted-foreground" />
            <span>{performance.car_year} {performance.car_make} {performance.car_model}</span>
          </CardTitle>
          <Badge variant={performance.car_status === 'available' ? 'default' : 'secondary'}>
            {performance.car_status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Financial Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Net Profit</p>
            <p className={`text-xl font-bold flex items-center ${
              performance.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {performance.netProfit >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              ${performance.netProfit.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Profit Margin</p>
            <p className={`text-xl font-bold ${
              performance.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {performance.profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Trips</p>
            <p className="font-semibold">{performance.totalTrips}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Utilization</p>
            <p className="font-semibold">{performance.utilizationRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Risk Score</p>
            <p className={`font-semibold ${getRiskColor()}`}>
              {performance.riskScore.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <div className={`p-1 rounded-full ${getRecommendationColor()} text-white`}>
              {getRecommendationIcon()}
            </div>
            <span className="font-medium text-sm capitalize">
              {performance.recommendation.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {performance.recommendationReason}
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails?.(performance.car_id)}
            className="flex-1"
          >
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onManageStatus?.(performance.car_id)}
          >
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}