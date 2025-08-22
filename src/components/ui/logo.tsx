import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8", 
  lg: "h-12 w-12",
  xl: "h-16 w-16"
};

export function Logo({ size = "lg", className, onClick }: LogoProps) {
  return (
    <img
      src="/teslys-logo.png"
      alt="TESLYS"
      className={cn(
        sizeClasses[size],
        "object-contain cursor-pointer transition-transform hover:scale-105",
        className
      )}
      onClick={onClick}
    />
  );
}