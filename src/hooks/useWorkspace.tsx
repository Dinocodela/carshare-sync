import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type WorkspaceRole = "client" | "host" | "investor";
export type WorkspaceRoleStatus = "active" | "pending" | "suspended";

export interface WorkspaceRoleRow {
  role: WorkspaceRole;
  status: WorkspaceRoleStatus;
}

interface WorkspaceContextType {
  activeWorkspace: WorkspaceRole;
  availableRoles: WorkspaceRoleRow[];
  landingSeen: Partial<Record<WorkspaceRole, boolean>>;
  loading: boolean;
  switchWorkspace: (role: WorkspaceRole) => Promise<void>;
  markLandingSeen: (role: WorkspaceRole) => Promise<void>;
  hasRole: (role: WorkspaceRole) => boolean;
  isRoleActive: (role: WorkspaceRole) => boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const ROLE_HOME: Record<WorkspaceRole, string> = {
  client: "/my-cars",
  host: "/host-car-management",
  investor: "/investor",
};

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceRole>("host");
  const [availableRoles, setAvailableRoles] = useState<WorkspaceRoleRow[]>([]);
  const [landingSeen, setLandingSeen] = useState<Partial<Record<WorkspaceRole, boolean>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (authLoading) return;
      if (!user) {
        setAvailableRoles([]);
        setLoading(false);
        return;
      }
      setLoading(true);

      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role,status").eq("user_id", user.id),
        supabase
          .from("profiles")
          .select("active_workspace,landing_seen")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (!alive) return;
      setAvailableRoles((roles ?? []) as WorkspaceRoleRow[]);
      if (profile?.active_workspace) {
        setActiveWorkspace(profile.active_workspace as WorkspaceRole);
      }
      setLandingSeen((profile?.landing_seen ?? {}) as Partial<Record<WorkspaceRole, boolean>>);
      setLoading(false);
    };
    load();
    return () => {
      alive = false;
    };
  }, [user, authLoading]);

  const hasRole = useCallback(
    (role: WorkspaceRole) => availableRoles.some((r) => r.role === role),
    [availableRoles]
  );

  const isRoleActive = useCallback(
    (role: WorkspaceRole) =>
      availableRoles.some((r) => r.role === role && r.status === "active"),
    [availableRoles]
  );

  const switchWorkspace = useCallback(
    async (role: WorkspaceRole) => {
      if (!user) return;
      setActiveWorkspace(role);
      await supabase
        .from("profiles")
        .update({ active_workspace: role })
        .eq("user_id", user.id);

      // Clients and hosts go straight to their workspace — no landing page.
      // Only the investor workspace shows a marketing landing page on first visit.
      if (role === "investor") {
        const seen = landingSeen[role];
        if (!seen) {
          navigate(`/welcome/${role}`);
          return;
        }
      }
      navigate(ROLE_HOME[role]);
    },
    [user, landingSeen, navigate]
  );

  const markLandingSeen = useCallback(
    async (role: WorkspaceRole) => {
      if (!user) return;
      const next = { ...landingSeen, [role]: true };
      setLandingSeen(next);
      await supabase.from("profiles").update({ landing_seen: next }).eq("user_id", user.id);
    },
    [user, landingSeen]
  );


  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        availableRoles,
        landingSeen,
        loading,
        switchWorkspace,
        markLandingSeen,
        hasRole,
        isRoleActive,
      }}
    >

      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

export const WORKSPACE_HOME = ROLE_HOME;
