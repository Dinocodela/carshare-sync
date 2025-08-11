import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CarSelectorProps {
  cars: any[];
  selectedCarId?: string;
  onCarSelect: (carId: string | undefined) => void;
  loading?: boolean;
}

export function CarSelector({ cars, selectedCarId, onCarSelect, loading }: CarSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <Car className="h-4 w-4 text-muted-foreground" />
        <div className="h-10 w-48 bg-muted rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Car className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedCarId || "all"} onValueChange={(value) => onCarSelect(value === "all" ? undefined : value)}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Select a car" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cars (Portfolio View)</SelectItem>
          {cars.map((car) => (
            <SelectItem key={car.id} value={car.id}>
              {car.year} {car.make} {car.model}
              <span className="ml-2 text-xs text-muted-foreground">
                ({car.status})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}