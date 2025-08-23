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
      'relative flex items-center justify-center rounded-full bg-gradient-logo shadow-navy transition-all duration-500 hover:scale-110 hover:shadow-glow animate-bounce',
      sizeClasses[size],
      className
    )}>
      <Car 
        size={iconSizes[size]} 
        className="text-white drop-shadow-lg relative z-10" 
      />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-white/5 to-black/15 pointer-events-none" />
      <div className="absolute inset-0 rounded-full border-2 border-white/30 pointer-events-none" />
      <div className="absolute -inset-1 rounded-full bg-white/10 blur-sm pointer-events-none" />
    </div>
  );
}