import { useParams, Link } from "react-router-dom";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlogPosts";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { SEO } from "@/components/SEO";
import { Logo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Twitter } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || "");
  const { data: allPosts = [] } = useBlogPosts();
  const { toast } = useToast();

  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && p.category === post?.category)
    .slice(0, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!" });
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post?.title || "");
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="w-full aspect-[16/9] rounded-xl" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Post not found</p>
          <Link to="/blog">
            <Button variant="outline">← Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${post.title} — Teslys Blog`}
        description={post.excerpt || post.title}
        canonical={`https://teslys.com/blog/${post.slug}`}
        ogImage={post.cover_image || undefined}
        ogType="article"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/blog" className="text-muted-foreground hover:text-foreground transition">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link to="/">
                <Logo className="h-7" />
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleCopyLink} title="Copy link">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShareTwitter} title="Share on X">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <article className="max-w-3xl mx-auto px-4 py-6">
          {/* Cover Image */}
          {post.cover_image && (
            <div className="rounded-xl overflow-hidden mb-6 aspect-[16/9]">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-primary text-primary-foreground">{post.category}</Badge>
            <span className="text-xs text-muted-foreground">
              {post.published_at ? format(new Date(post.published_at), "MMMM d, yyyy") : ""}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            {post.title}
          </h1>

          {/* Author */}
          <p className="text-sm text-muted-foreground mb-8">By {post.author_name}</p>

          {(() => {
            // Strip emojis from headings for a professional look
            const cleanContent = post.content
              .replace(/(<h[23][^>]*>)\s*[\p{Emoji_Presentation}\p{Extended_Pictographic}]+\s*/gu, '$1');
            return null;
          })()}

          {/* Content */}
          <div
            className="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert
              prose-headings:text-foreground prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-extrabold prose-h2:mt-14 prose-h2:mb-6
              prose-h3:text-xl prose-h3:md:text-2xl prose-h3:font-bold prose-h3:mt-12 prose-h3:mb-5
              prose-p:text-foreground/85 prose-p:leading-[1.85] prose-p:mb-7
              prose-strong:text-foreground prose-strong:font-semibold
              prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80
              prose-ul:my-6 prose-ul:space-y-3 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-6 prose-ol:space-y-3 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-foreground/85 prose-li:leading-relaxed prose-li:pl-1
              prose-img:rounded-xl prose-img:shadow-md
              prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:my-8 prose-blockquote:not-italic
              [&_p+p]:mt-7 [&_h2+p]:mt-5 [&_h3+p]:mt-5 [&_ul_li::marker]:text-primary [&_ol_li::marker]:text-primary [&_ol_li::marker]:font-semibold"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-8 border-t border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPosts.map((p) => (
                <BlogPostCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}

        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Teslys. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
