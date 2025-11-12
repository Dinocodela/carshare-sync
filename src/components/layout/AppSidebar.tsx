import { useEffect, useState } from 'react';
import { Car, Home, Plus, Settings, BarChart3, Shield, Users, Mail, Send } from 'lucide-react';
import { NavLink } from 'react-router-dom';
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
} from '@/components/ui/sidebar';

interface Profile {
  role: 'client' | 'host';
  name?: string;
  company_name?: string;
  is_super_admin?: boolean;
}

export function AppSidebar() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'client' | 'host' | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_super_admin')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setUserRole(profile.role as 'client' | 'host');
        setIsAdmin(profile.is_super_admin || false);
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
          url: "/settings",
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
          title: "Hosted Cars",
          url: "/host-car-management",
          icon: Car,
        },
        {
          title: "Claims",
          url: "/host-car-management#claims",
          icon: Shield,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
        }
      ];
    }

    return baseItems;
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

        {/* Admin Section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/manage-accounts">
                      <Users />
                      <span>Manage Accounts</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/newsletter-management">
                      <Mail />
                      <span>Subscribers</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/newsletter-campaigns">
                      <Send />
                      <span>Campaigns</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/email-templates">
                      <Mail />
                      <span>Templates</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}