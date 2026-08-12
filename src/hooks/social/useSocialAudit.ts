import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export type SocialAuditEntry = Database["public"]["Tables"]["social_audit_log"]["Row"];
export type SocialPublishAttempt =
  Database["public"]["Tables"]["social_publish_attempts"]["Row"];

/** A pending attempt older than this is considered stuck and can be released. */
const STALE_ATTEMPT_MINUTES = 15;

export function useSocialAuditLog(filters?: {
  entityType?: string | "all";
  entityId?: string;
  limit?: number;
}) {
  const entityType = filters?.entityType ?? "all";
  const entityId = filters?.entityId;
  const limit = filters?.limit ?? 200;

  return useQuery({
    queryKey: ["social", "audit", entityType, entityId ?? null, limit],
    queryFn: async () => {
      let query = supabase
        .from("social_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (entityType && entityType !== "all") query = query.eq("entity_type", entityType);
      if (entityId) query = query.eq("entity_id", entityId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SocialAuditEntry[];
    },
  });
}

/** All publish attempts, newest first. Pass a postId to scope to one post. */
export function usePublishAttempts(postId?: string) {
  return useQuery({
    queryKey: ["social", "attempts", postId ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("social_publish_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (postId) query = query.eq("post_id", postId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SocialPublishAttempt[];
    },
  });
}

/**
 * Retry a failed publish.
 * Releases any stuck `pending` attempt (older than STALE_ATTEMPT_MINUTES) first so the
 * one-active-attempt lock doesn't permanently block a post, then re-invokes the
 * server-side publish function — every other safeguard still runs there.
 */
export function useRetryPublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const staleBefore = new Date(
        Date.now() - STALE_ATTEMPT_MINUTES * 60 * 1000,
      ).toISOString();

      await supabase
        .from("social_publish_attempts")
        .update({
          status: "failed",
          error_message: "Released as stale by admin retry",
          finished_at: new Date().toISOString(),
        })
        .eq("post_id", postId)
        .eq("status", "pending")
        .lt("created_at", staleBefore);

      const { data, error } = await supabase.functions.invoke("social-publish", {
        body: { post_id: postId },
      });
      if (error) throw error;
      if (data && data.ok === false) throw new Error(data.reason ?? "Publish failed");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social", "posts"] });
      qc.invalidateQueries({ queryKey: ["social", "attempts"] });
      qc.invalidateQueries({ queryKey: ["social", "audit"] });
      toast.success("Retry published to Instagram");
    },
    onError: (e: Error) => toast.error(`Retry failed: ${e.message}`),
  });
}
