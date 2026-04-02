import { cn } from '@/lib/utils';
import teslysLogo from '@/assets/teslys-logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  linked?: boolean;
}

export function Logo({ className, size = 'lg', linked = false }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const img = (
    <img
      src={teslysLogo}
      alt="Teslys"
      className={cn(sizeClasses[size], 'object-contain', className)}
    />
  );

  if (linked) {
    return (
      <a href="https://teslys.app" target="_blank" rel="noopener noreferrer">
        {img}
      </a>
    );
  }

  return img;
}
