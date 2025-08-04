import { useEffect, useState } from 'react';
import { Car, ChevronUp, Home, LogOut, Plus, Settings, User2, Inbox, BarChart3 } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

interface Profile {
  role: 'client' | 'host';
  name?: string;
  company_name?: string;
}

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<'client' | 'host' | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setUserRole(profile.role as 'client' | 'host');
      }
    };

    fetchUserRole();
  }, [user]);

  const getMenuItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      }
    ];

    if (userRole === 'client') {
      return [
        ...baseItems,
        {
          title: "Analytics",
          url: "/client-analytics",
          icon: BarChart3,
        },
        {
          title: "My Cars",
          url: "/my-cars",
          icon: Car,
        },
        {
          title: "Add Car",
          url: "/add-car",
          icon: Plus,
        },
        {
          title: "Settings",
          url: "#",
          icon: Settings,
        }
      ];
    } else if (userRole === 'host') {
      return [
        ...baseItems,
        {
          title: "Analytics",
          url: "/host-analytics",
          icon: BarChart3,
        },
        {
          title: "Host Requests",
          url: "/host-requests",
          icon: Inbox,
        },
        {
          title: "Hosted Cars",
          url: "/host-car-management",
          icon: Car,
        },
        {
          title: "Settings",
          url: "#",
          icon: Settings,
        }
      ];
    }

    return baseItems;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar collapsible="icon">
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <User2 />
              <span>{user?.email}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}