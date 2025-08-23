import { PasswordValidation } from '@/lib/passwordValidation';

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidation;
  show: boolean;
}

export function PasswordStrengthIndicator({ validation, show }: PasswordStrengthIndicatorProps) {
  if (!show) return null;

  const getStrengthColor = () => {
    switch (validation.strength) {
      case 'strong':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  const getStrengthBars = () => {
    const bars = [];
    const activeCount = validation.strength === 'strong' ? 3 : validation.strength === 'medium' ? 2 : 1;
    
    for (let i = 0; i < 3; i++) {
      bars.push(
        <div
          key={i}
          className={`h-1 flex-1 rounded ${
            i < activeCount
              ? validation.strength === 'strong'
                ? 'bg-green-500'
                : validation.strength === 'medium'
                ? 'bg-yellow-500'
                : 'bg-red-500'
              : 'bg-muted'
          }`}
        />
      );
    }
    return bars;
  };

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Strength:</span>
        <span className={getStrengthColor()}>{validation.strength}</span>
        <div className="flex gap-1 flex-1 max-w-[60px]">
          {getStrengthBars()}
        </div>
      </div>
      
      {validation.errors.length > 0 && (
        <ul className="space-y-1">
          {validation.errors.map((error, index) => (
            <li key={index} className="text-red-600 text-xs flex items-center gap-1">
              <span className="w-1 h-1 bg-red-600 rounded-full"></span>
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}