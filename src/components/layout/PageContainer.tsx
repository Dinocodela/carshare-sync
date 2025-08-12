import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

// A simple responsive container to keep content readable on mobile
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-screen-lg px-4 sm:px-0 pb-[env(safe-area-inset-bottom)]", className)}>
      {children}
    </div>
  );
}
