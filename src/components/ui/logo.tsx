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
      'relative flex items-center justify-center rounded-full bg-gradient-logo shadow-navy transition-all duration-300 hover:scale-105 hover:shadow-glow',
      sizeClasses[size],
      className
    )}>
      <Car 
        size={iconSizes[size]} 
        className="text-white drop-shadow-md relative z-10" 
      />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 via-transparent to-black/10 pointer-events-none" />
      <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
    </div>
  );
}