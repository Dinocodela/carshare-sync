import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CatalogWrap,
  fallbackCatalog,
  rowToCatalog,
} from "@/lib/wrapCatalog";

/** Published wraps for the public gallery, with a static fallback. */
export function useWrapDesigns() {
  const query = useQuery({
    queryKey: ["wrap-designs", "published"],
    queryFn: async (): Promise<CatalogWrap[]> => {
      const { data, error } = await supabase
        .from("wrap_designs")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(rowToCatalog);
    },
    staleTime: 5 * 60 * 1000,
  });

  const wraps =
    query.data && query.data.length > 0 ? query.data : fallbackCatalog;

  return { wraps, isLoading: query.isLoading, error: query.error };
}

/** All wraps (published or not) for the admin studio. */
export function useAllWrapDesigns() {
  return useQuery({
    queryKey: ["wrap-designs", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wrap_designs")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
