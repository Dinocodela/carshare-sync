import { Link } from "react-router-dom";
import { format } from "date-fns";
import type { BlogPost } from "@/hooks/useBlogPosts";
import blogDefaultCover from "@/assets/blog-default-cover.jpg";

interface BlogSidebarItemProps {
  post: BlogPost;
  index?: number;
}

export function BlogSidebarItem({ post, index }: BlogSidebarItemProps) {
  return (
    <Link to={`/blog/${post.slug}`} className="group flex gap-3 items-start py-2.5 border-b border-border last:border-0">
      {index !== undefined && (
        <span className="text-2xl font-bold text-muted-foreground/40 shrink-0 w-7 text-right">
          {index + 1}
        </span>
      )}
      <div className="w-16 h-16 rounded overflow-hidden shrink-0">
        <img
          src={post.cover_image || blogDefaultCover}
          alt={post.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <h4 className="text-xs font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </h4>
        <p className="text-[10px] text-muted-foreground">
          {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
        </p>
      </div>
    </Link>
  );
}
