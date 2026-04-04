import { cn } from '@/lib/utils';
import teslysLogo from '@/assets/teslys-logo-clean.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  linked?: boolean;
}

export function Logo({ className, size = 'lg', linked = false }: LogoProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28'
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
