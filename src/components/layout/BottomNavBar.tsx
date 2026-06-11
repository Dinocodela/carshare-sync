import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BarChart3,
  Car,
  Settings,
  Plus,
  Route as RouteIcon,
  MoreHorizontal,
  Users,
  Shield,
  Receipt,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type Role = "client" | "host";
interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  kind?: "add" | "more" | "default";
}

export function BottomNavBar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

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
      if (metaRole) {
        setLoadingRole(false);
      }
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
  }, [user?.id, metaRole]);

  const moreItem: NavItem = {
    title: "More",
    url: "#more",
    icon: MoreHorizontal,
    kind: "more",
  };

  const clientItems: NavItem[] = useMemo(
    () => [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Trips", url: "/trips", icon: RouteIcon },
      { title: "Add", url: "/add-car", icon: Plus, kind: "add" },
      { title: "Analytics", url: "/client-analytics", icon: BarChart3 },
      moreItem,
    ],
    []
  );

  const hostItems: NavItem[] = useMemo(
    () => [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Trips", url: "/trips", icon: RouteIcon },
      { title: "Hosted", url: "/host-car-management#active", icon: Car },
      { title: "Analytics", url: "/host-analytics", icon: BarChart3 },
      moreItem,
    ],
    []
  );

  // Secondary items shown in the "More" drawer
  const clientMoreItems: NavItem[] = useMemo(
    () => [
      { title: "My Cars", url: "/my-cars", icon: Car },
      { title: "Fixed Expenses", url: "/client-fixed-expenses", icon: Receipt },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
    []
  );

  const hostMoreItems: NavItem[] = useMemo(
    () => [
      { title: "Hosted Cars", url: "/host-car-management", icon: Car },
      { title: "Clients", url: "/registered-clients", icon: Users },
      { title: "Claims", url: "/host-car-management#claims", icon: Shield },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
    []
  );

  const loadingItems: NavItem[] = useMemo(
    () => [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Trips", url: "/trips", icon: RouteIcon },
      { title: "Settings", url: "/settings", icon: Settings },
      moreItem,
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

        if (item.kind === "more") {
          return (
            <li key={item.title} className="min-w-0">
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                aria-label={item.title}
                className={`${linkBase} ${
                  moreOpen ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                <Icon className={iconBase} />
                <span className="leading-none truncate">{item.title}</span>
              </button>
            </li>
          );
        }

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

  const moreItems =
    role === "host" ? hostMoreItems : role === "client" ? clientMoreItems : clientMoreItems;

  const handleMoreNavigate = (url: string) => {
    setMoreOpen(false);
    navigate(url);
  };

  return (
    <>
      <nav
        className="
          fixed bottom-0 inset-x-0 z-50 md:hidden
          border-t
          pb-safe-bottom
          backdrop-blur-md bg-background/70 supports-[backdrop-filter]:bg-background/60
          shadow-[0_-6px_16px_rgba(0,0,0,0.05)]
        "
        aria-label="Bottom navigation"
      >
        {loadingRole
          ? renderItems(loadingItems)
          : role === "client"
          ? renderItems(clientItems)
          : role === "host"
          ? renderItems(hostItems)
          : renderItems(loadingItems)}
      </nav>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="md:hidden">
          <DrawerHeader className="text-left">
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <ul className="px-2 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            {moreItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={() => handleMoreNavigate(item.url)}
                    className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-muted active:bg-muted"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-base font-medium">
                      {item.title}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              );
            })}
          </ul>
        </DrawerContent>
      </Drawer>
    </>
  );
}
