import { Car, Home, Plus, Settings, BarChart3, Shield, Users, BookOpen, Route as RouteIcon, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';

import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { useWorkspace } from '@/hooks/useWorkspace';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

type MenuItem = { title: string; url: string; icon: typeof Home };

export function AppSidebar() {
  const { activeWorkspace } = useWorkspace();

  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      { title: "Dashboard", url: "/dashboard", icon: Home },
    ];

    if (activeWorkspace === 'client') {
      return [
        ...baseItems,
        { title: "Trips", url: "/trips", icon: RouteIcon },
        { title: "Analytics", url: "/client-analytics", icon: BarChart3 },
        { title: "My Cars", url: "/my-cars", icon: Car },
        { title: "Add Car", url: "/add-car", icon: Plus },
        { title: "Blog", url: "/blog", icon: BookOpen },
        { title: "Settings", url: "/settings", icon: Settings },
      ];
    }

    if (activeWorkspace === 'host') {
      return [
        ...baseItems,
        { title: "Trips", url: "/trips", icon: RouteIcon },
        { title: "Analytics", url: "/host-analytics", icon: BarChart3 },
        { title: "Hosted Cars", url: "/host-car-management", icon: Car },
        { title: "Clients", url: "/registered-clients", icon: Users },
        { title: "Claims", url: "/host-car-management#claims", icon: Shield },
        { title: "Blog", url: "/blog", icon: BookOpen },
        { title: "Settings", url: "/settings", icon: Settings },
      ];
    }

    if (activeWorkspace === 'investor') {
      return [
        { title: "Portfolio", url: "/investor", icon: TrendingUp },
        { title: "Marketplace", url: "/investor/marketplace", icon: ShoppingBag },
        { title: "Payouts", url: "/investor/payouts", icon: DollarSign },
        { title: "Payout Settings", url: "/investor/payout-settings", icon: Settings },
        { title: "Blog", url: "/blog", icon: BookOpen },
      ];
    }


    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2">
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
