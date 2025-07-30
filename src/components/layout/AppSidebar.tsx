import { useEffect, useState } from 'react';
import { Car, DollarSign, FileText, Home, LogOut, Settings, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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

const clientMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Cars", url: "/cars", icon: Car },
  { title: "Expenses", url: "/expenses", icon: DollarSign },
  { title: "Claims", url: "/claims", icon: FileText },
];

const hostMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Car Listings", url: "/cars", icon: Car },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Earnings", url: "/earnings", icon: DollarSign },
  { title: "Reports", url: "/reports", icon: FileText },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      // For now, use user metadata until database is ready
      const role = user.user_metadata?.role || 'client';
      const name = user.user_metadata?.name || user.user_metadata?.admin_name;
      const company_name = user.user_metadata?.company_name;
      
      setProfile({
        role,
        name,
        company_name,
      });
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = profile?.role === 'host' ? hostMenuItems : clientMenuItems;
  const displayName = profile?.role === 'host' 
    ? profile.company_name || 'Host' 
    : profile?.name || 'Client';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-primary">Telsys</h2>
          <p className="text-sm text-muted-foreground capitalize">
            {profile?.role} Portal
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) =>
                        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-sm text-muted-foreground mb-2">
          Welcome, {displayName}
        </div>
        <SidebarMenuButton onClick={handleSignOut} className="w-full">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}