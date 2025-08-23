import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className, size = 'lg' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };

  return (
    <div className={cn(
      'relative flex items-center justify-center rounded-full bg-gradient-primary shadow-glow transition-all duration-300 hover:scale-105',
      sizeClasses[size],
      className
    )}>
      <Car 
        size={iconSizes[size]} 
        className="text-primary-foreground drop-shadow-sm" 
      />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
    </div>
  );
}