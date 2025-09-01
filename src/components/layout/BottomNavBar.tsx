import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  BarChart3,
  Car,
  Settings,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Role = "client" | "host";
interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  kind?: "add" | "default";
}

export function BottomNavBar() {
  const { user } = useAuth();
  const location = useLocation();

  // ✅ Seed from user metadata to avoid initial flash
  const metaRole = (user?.user_metadata?.role as Role | undefined) ?? null;
  const [role, setRole] = useState<Role | null>(metaRole);
  const [loadingRole, setLoadingRole] = useState<boolean>(!metaRole && !!user);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        setRole(null);
        setLoadingRole(false);
        return;
      }
      // If we already have a reliable role from metadata, don’t flash/fetch immediately
      if (metaRole) {
        setLoadingRole(false);
      }
      // Always confirm from DB (in case role changed), but don’t show fallback with Add meanwhile
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (data?.role === "client" || data?.role === "host") setRole(data.role);
      setLoadingRole(false);
    })();
    return () => {
      cancelled = true;
    };
    // include metaRole so if metadata changes we re-evaluate loading state
  }, [user?.id, metaRole]);

  const clientItems: NavItem[] = useMemo(
    () => [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Analytics", url: "/client-analytics", icon: BarChart3 },
      { title: "Add", url: "/add-car", icon: Plus, kind: "add" },
      { title: "My Cars", url: "/my-cars", icon: Car },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
    []
  );

  const hostItems: NavItem[] = useMemo(
    () => [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Analytics", url: "/host-analytics", icon: BarChart3 },
      { title: "Hosted", url: "/host-car-management#active", icon: Car },
      {
        title: "Claims",
        url: "/host-car-management#claims",
        icon: ShieldAlert,
      },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
    []
  );

  // Minimal neutral placeholder (no “Add”) while confirming role
  const loadingItems: NavItem[] = useMemo(
    () => [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Analytics", url: "/client-analytics", icon: BarChart3 },
      { title: "My Cars", url: "/my-cars", icon: Car },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
    []
  );

  const isActive = (item: NavItem) => {
    const currentPath = location.pathname;
    const currentHash = location.hash;
    const [path, hash] = item.url.split("#");
    const pathMatch =
      currentPath === path || currentPath.startsWith(path + "/");
    const hashMatch = hash ? currentHash === `#${hash}` : true;
    return pathMatch && hashMatch;
  };

  const linkBase =
    "relative flex flex-col items-center justify-center gap-1 py-2 w-full h-full text-xs";
  const iconBase = "h-5 w-5";

  const renderItems = (items: NavItem[]) => (
    <ul
      className="grid h-16 w-full px-2"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;

        if (item.kind === "add") {
          return (
            <li key={item.title} className="min-w-0">
              <NavLink
                to={item.url}
                end
                aria-label={item.title}
                className={`${linkBase} ${
                  active ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center rounded-xl p-2 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-primary text-primary-foreground/95 shadow"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </NavLink>
            </li>
          );
        }

        return (
          <li key={item.title} className="min-w-0">
            <NavLink
              to={item.url}
              end
              aria-label={item.title}
              className={`${linkBase} ${
                active ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              <Icon className={iconBase} />
              <span className="leading-none truncate">{item.title}</span>
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav
      className="
        fixed bottom-0 inset-x-0 z-50 md:hidden
        border-t
		pb-safe-bottom
        backdrop-blur-md bg-white/70 supports-[backdrop-filter]:bg-white/60
        shadow-[0_-6px_16px_rgba(0,0,0,0.05)]
      "
      aria-label="Bottom navigation"
    >
      {
        loadingRole
          ? renderItems(loadingItems) // ← no Add while loading/confirming
          : role === "client"
          ? renderItems(clientItems)
          : role === "host"
          ? renderItems(hostItems)
          : renderItems(loadingItems) /* unknown role fallback without Add */
      }
    </nav>
  );
}
