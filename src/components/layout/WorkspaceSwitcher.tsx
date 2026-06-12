import { Briefcase, Car, TrendingUp, Check, ChevronsUpDown } from "lucide-react";
import { useWorkspace, type WorkspaceRole } from "@/hooks/useWorkspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const META: Record<
  WorkspaceRole,
  { label: string; description: string; Icon: typeof Car }
> = {
  client: {
    label: "Client",
    description: "Own a Tesla we manage for you",
    Icon: Car,
  },
  host: {
    label: "Host",
    description: "Manage client vehicles",
    Icon: Briefcase,
  },
  investor: {
    label: "Investor",
    description: "Invest in Tesla fleet vehicles",
    Icon: TrendingUp,
  },
};

const ORDER: WorkspaceRole[] = ["host", "client", "investor"];

export function WorkspaceSwitcher({ onSwitch }: { onSwitch?: () => void } = {}) {
  const { activeWorkspace, availableRoles, switchWorkspace, loading } = useWorkspace();

  if (loading || availableRoles.length === 0) return null;

  const active = META[activeWorkspace];
  const ActiveIcon = active.Icon;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between gap-2 h-auto py-2"
          aria-label="Switch workspace"
        >
          <span className="flex items-center gap-2 min-w-0">
            <ActiveIcon className="h-4 w-4 shrink-0" />
            <span className="flex flex-col items-start min-w-0">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">
                Workspace
              </span>
              <span className="text-sm font-medium truncate">{active.label}</span>
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-popover z-50">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ORDER.map((role) => {
          const row = availableRoles.find((r) => r.role === role);
          if (!row) return null;
          const { Icon, label, description } = META[role];
          const isActive = role === activeWorkspace;
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => !isActive && switchWorkspace(role)}
              className="gap-3 py-2 cursor-pointer"
            >
              <Icon className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{label}</span>
                  {row.status === "pending" && (
                    <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                  )}
                  {row.status === "suspended" && (
                    <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">{description}</div>
              </div>
              {isActive && <Check className="h-4 w-4 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
