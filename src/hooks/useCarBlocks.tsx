import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CarBlock {
  id: string;
  car_id: string;
  created_by: string;
  start_at: string; // ISO
  end_at: string; // ISO
  notes: string | null;
}

export function useCarBlocks(
  carIds: string[],
  windowStart: Date,
  windowEnd: Date
) {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<CarBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const startISO = windowStart.toISOString();
  const endISO = windowEnd.toISOString();
  const carKey = carIds.slice().sort().join(",");

  useEffect(() => {
    if (!user || carIds.length === 0) {
      setBlocks([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("car_blocks" as any)
        .select("id, car_id, created_by, start_at, end_at, notes")
        .in("car_id", carIds)
        .lte("start_at", endISO)
        .gte("end_at", startISO);
      if (!cancelled) {
        if (error) {
          console.error("Failed to load car blocks", error);
          setBlocks([]);
        } else {
          setBlocks((data as any) || []);
        }
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, carKey, startISO, endISO, reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  const createBlock = useCallback(
    async (input: {
      car_id: string;
      start_at: string;
      end_at: string;
      notes?: string | null;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("car_blocks" as any)
        .insert({
          car_id: input.car_id,
          created_by: user.id,
          start_at: input.start_at,
          end_at: input.end_at,
          notes: input.notes || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      // Fire-and-forget Slack notification
      supabase.functions
        .invoke("notify-car-block", { body: { block_id: (data as any).id } })
        .catch((e) => console.warn("notify-car-block invoke failed", e));
      refresh();
      return data;
    },
    [user, refresh]
  );

  const deleteBlock = useCallback(
    async (id: string) => {
      // Notify Slack BEFORE deletion so the edge function can still read the row.
      try {
        await supabase.functions.invoke("notify-car-block", {
          body: { block_id: id, removed: true },
        });
      } catch (e) {
        console.warn("notify-car-block (removed) invoke failed", e);
      }
      const { error } = await supabase
        .from("car_blocks" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      refresh();
    },
    [refresh]
  );

  return { blocks, loading, refresh, createBlock, deleteBlock };
}
