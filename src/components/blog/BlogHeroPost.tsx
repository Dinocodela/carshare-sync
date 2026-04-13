import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { BlogPost } from "@/hooks/useBlogPosts";
import blogDefaultCover from "@/assets/blog-default-cover.jpg";

interface BlogHeroPostProps {
  post: BlogPost;
}

export function BlogHeroPost({ post }: BlogHeroPostProps) {
  return (
    <Link to={`/blog/${post.slug}`} className="group block relative rounded-xl overflow-hidden aspect-[16/9] md:aspect-[21/9]">
      <img
        src={post.cover_image || blogDefaultCover}
        alt={post.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 space-y-2">
        <Badge className="bg-primary text-primary-foreground">{post.category}</Badge>
        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white leading-tight line-clamp-3">
          {post.title}
        </h2>
        <p className="text-sm text-white/80 hidden md:block line-clamp-2 max-w-2xl">
          {post.excerpt}
        </p>
        <p className="text-xs text-white/60">
          {post.author_name} • {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
        </p>
      </div>
    </Link>
  );
}
