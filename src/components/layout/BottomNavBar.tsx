import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, BarChart3, Car, Settings, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function BottomNavBar() {
  const { user } = useAuth();
  const [role, setRole] = useState<"client" | "host" | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      if (data?.role === "client" || data?.role === "host") setRole(data.role);
    };
    loadRole();
  }, [user]);

  const items: NavItem[] = (() => {
    const base: NavItem[] = [{ title: "Dashboard", url: "/dashboard", icon: Home }];
    if (role === "client") {
      return [
        ...base,
        { title: "Analytics", url: "/client-analytics", icon: BarChart3 },
        { title: "My Cars", url: "/my-cars", icon: Car },
        { title: "Add Car", url: "/add-car", icon: Plus },
        { title: "Settings", url: "/settings", icon: Settings },
      ];
    }
    if (role === "host") {
      return [
        ...base,
        { title: "Analytics", url: "/host-analytics", icon: BarChart3 },
        { title: "Hosted", url: "/host-car-management", icon: Car },
        { title: "Settings", url: "/settings", icon: Settings },
      ];
    }
    // Fallback while role loads
    return base;
  })();

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${isActive ? "text-primary" : "text-muted-foreground"} flex flex-col items-center justify-center gap-1 py-2 w-full h-full`;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-background border-t md:hidden h-bottom-nav pb-safe-bottom">
      <ul className="grid h-full w-full px-2" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => (
          <li key={item.title} className="min-w-0">
            <NavLink to={item.url} end className={getLinkClass} aria-label={item.title}>
              <item.icon className="h-5 w-5" />
              <span className="text-[11px] leading-none truncate max-w-full">{item.title}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
