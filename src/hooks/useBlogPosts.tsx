import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string;
  tags: string[];
  author_name: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useBlogPosts(category?: string) {
  return useQuery({
    queryKey: ["blog-posts", category],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts" as any)
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as BlogPost[]) || [];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("blog_posts" as any)
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single() as any);
      if (error) throw error;
      return data as unknown as BlogPost;
    },
    enabled: !!slug,
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts" as any)
        .select("category")
        .eq("is_published", true);
      if (error) throw error;
      const categories = [
        ...new Set((data as any[]).map((p: any) => p.category)),
      ];
      return ["All", ...categories] as string[];
    },
  });
}
