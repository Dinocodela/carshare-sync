import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export type SocialPost = Database["public"]["Tables"]["social_posts"]["Row"];
export type SocialLead = Database["public"]["Tables"]["social_leads"]["Row"];
export type SocialAccount = Database["public"]["Tables"]["social_accounts"]["Row"];
export type SocialSettings =
  Database["public"]["Tables"]["social_automation_settings"]["Row"];
export type SocialMediaAsset =
  Database["public"]["Tables"]["social_media_assets"]["Row"];
export type PostStatus = Database["public"]["Enums"]["social_post_status"];
export type PostFormat = Database["public"]["Enums"]["social_post_format"];
export type LeadStage = Database["public"]["Enums"]["social_lead_stage"];

/** The 9-item compliance checklist. Never pre-ticked — this is a legal audit trail. */
export const COMPLIANCE_CHECKLIST: { key: string; label: string }[] = [
  { key: "brand_safe", label: "Content is brand safe and on-message" },
  { key: "claims_substantiated", label: "Earnings/performance claims are substantiated" },
  { key: "no_pii", label: "No customer PII or private data is visible" },
  { key: "media_rights_cleared", label: "Media rights and model releases are cleared" },
  { key: "pricing_accurate", label: "Any pricing or offer shown is accurate" },
  { key: "disclosures_present", label: "Required disclosures are present (ad/AI)" },
  { key: "cta_link_verified", label: "CTA keyword and destination link verified" },
  { key: "accessibility_alt_text", label: "Alt text added for accessibility" },
  { key: "legal_reviewed", label: "Reviewed against legal/compliance guidance" },
];

export const DEFAULT_TIMEZONE = "America/Los_Angeles";

/* ---------------- Settings + account ---------------- */

export function useSocialSettings() {
  return useQuery({
    queryKey: ["social", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_automation_settings")
        .select("*")
        .order("created_at")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SocialSettings | null;
    },
  });
}

export function useUpdateSocialSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<SocialSettings> & { id: string }) => {
      const { id, ...rest } = patch;
      const { error } = await supabase
        .from("social_automation_settings")
        .update(rest)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social", "settings"] });
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSocialAccount() {
  return useQuery({
    queryKey: ["social", "account"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("platform", "instagram")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SocialAccount | null;
    },
  });
}

/* ---------------- Posts ---------------- */

export function useSocialPosts(status?: PostStatus | "all") {
  return useQuery({
    queryKey: ["social", "posts", status ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("social_posts")
        .select("*")
        .order("scheduled_at", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (status && status !== "all") query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SocialPost[];
    },
  });
}

export function usePostAssets(postId?: string) {
  return useQuery({
    queryKey: ["social", "assets", postId],
    enabled: !!postId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_media_assets")
        .select("*")
        .eq("post_id", postId!)
        .order("position");
      if (error) throw error;
      return (data ?? []) as SocialMediaAsset[];
    },
  });
}

export interface SavePostInput {
  id?: string;
  title?: string | null;
  caption: string;
  hashtags: string[];
  format: PostFormat;
  cta_keyword?: string | null;
  destination_url?: string | null;
  first_comment?: string | null;
  ai_disclosure: boolean;
  campaign?: string | null;
  internal_notes?: string | null;
  timezone: string;
  /** Only set when the admin actually picked a date+time. */
  scheduled_at?: string;
  /** Explicit opt-in required to null out an existing schedule. */
  clear_schedule?: boolean;
  submit_for_review?: boolean;
}

export function useSavePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SavePostInput) => {
      const { id, scheduled_at, clear_schedule, submit_for_review, ...rest } = input;

      const payload: Record<string, unknown> = { ...rest };
      // A missing schedule value must NEVER clear an existing scheduled_at.
      if (clear_schedule) payload.scheduled_at = null;
      else if (scheduled_at) payload.scheduled_at = scheduled_at;

      if (id) {
        if (submit_for_review) payload.status = "needs_review";
        const { error } = await supabase.from("social_posts").update(payload).eq("id", id);
        if (error) throw error;
        return id;
      }

      const { data: userData } = await supabase.auth.getUser();
      payload.created_by = userData.user?.id ?? null;
      payload.owner_user_id = userData.user?.id ?? null;
      payload.status = submit_for_review ? "needs_review" : "draft";

      const { data, error } = await supabase
        .from("social_posts")
        .insert(payload as never)
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social", "posts"] });
      toast.success("Post saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePostStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PostStatus }) => {
      const { error } = await supabase.from("social_posts").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social", "posts"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------------- Edge-function actions ---------------- */

export function useApprovePosts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      post_ids: string[];
      checklist: Record<string, boolean>;
      notes?: string;
      move_to_scheduled?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke("social-approve", {
        body: payload,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { approved: string[]; skipped: { id: string; reason: string }[] };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["social", "posts"] });
      toast.success(
        `Approved ${data.approved.length} post${data.approved.length === 1 ? "" : "s"}` +
          (data.skipped.length ? ` · ${data.skipped.length} skipped` : ""),
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function usePublishNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await supabase.functions.invoke("social-publish", {
        body: { post_id: postId },
      });
      if (error) throw error;
      if (data && data.ok === false) throw new Error(data.reason ?? "Publish failed");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social", "posts"] });
      toast.success("Published to Instagram");
    },
    onError: (e: Error) => toast.error(`Publish failed: ${e.message}`),
  });
}

export function useConnectInstagram() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("social-ig-oauth-start", {
        body: {},
      });
      if (error) throw error;
      if (!data?.url) throw new Error(data?.error ?? "Could not start connection");
      window.location.href = data.url as string;
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDisconnectInstagram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from("social_accounts")
        .update({ status: "disconnected", last_error: null })
        .eq("id", accountId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social", "account"] });
      toast.success("Instagram disconnected");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------------- Leads ---------------- */

export function useSocialLeads() {
  return useQuery({
    queryKey: ["social", "leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_leads")
        .select("*")
        .order("last_interaction_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as SocialLead[];
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<SocialLead> & { id: string }) => {
      const { error } = await supabase.from("social_leads").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social", "leads"] });
      toast.success("Lead updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useLeadInteractions(leadId?: string) {
  return useQuery({
    queryKey: ["social", "interactions", leadId],
    enabled: !!leadId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_interactions")
        .select("*")
        .eq("lead_id", leadId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
