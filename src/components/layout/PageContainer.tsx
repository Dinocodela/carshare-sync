import React from "react";
import { cn } from "@/lib/utils";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
}

// A simple responsive container to keep content readable on mobile
export function PageContainer({ children, className, showBreadcrumbs = true }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-screen-lg px-4 sm:px-0 pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      {showBreadcrumbs && <BreadcrumbNav />}
      {children}
    </div>
  );
}
