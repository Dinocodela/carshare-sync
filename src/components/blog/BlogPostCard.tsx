import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { BlogPost } from "@/hooks/useBlogPosts";
import blogDefaultCover from "@/assets/blog-default-cover.jpg";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <div className="rounded-lg overflow-hidden border border-border bg-card transition-shadow hover:shadow-lg">
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.cover_image || blogDefaultCover}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="p-3 md:p-4 space-y-2">
          <Badge variant="secondary" className="text-[10px]">{post.category}</Badge>
          <h3 className="font-semibold text-sm md:text-base leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
          <p className="text-[10px] text-muted-foreground">
            {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
