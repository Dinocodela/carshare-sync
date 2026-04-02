import { useState } from "react";
import { Link } from "react-router-dom";
import { useBlogPosts, useBlogCategories } from "@/hooks/useBlogPosts";
import { BlogHeroPost } from "@/components/blog/BlogHeroPost";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogSidebarItem } from "@/components/blog/BlogSidebarItem";
import { BlogCategoryFilter } from "@/components/blog/BlogCategoryFilter";
import { SEO } from "@/components/SEO";
import { Logo } from "@/components/ui/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function Blog() {
  const [category, setCategory] = useState("All");
  const { data: posts = [], isLoading } = useBlogPosts(category);
  const { data: categories = [] } = useBlogCategories();

  const heroPost = posts[0];
  const trendingPosts = posts.slice(0, 5);
  const latestPosts = posts.slice(0, 6);
  const gridPosts = posts.slice(1);

  return (
    <>
      <SEO
        title="Teslys Blog — Tesla Car Sharing Tips & Passive Income"
        description="Expert insights on Tesla car sharing, passive income strategies, rental management, and vehicle maintenance tips from the Teslys team."
        canonical="https://teslys.com/blog"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link to="/">
                <Logo className="h-7" />
              </Link>
              <span className="text-lg font-bold text-foreground hidden sm:inline">Blog</span>
            </div>
            <Link
              to="/"
              className="text-xs font-medium text-primary hover:underline"
            >
              Get Started →
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
          {/* Category Filter */}
          {categories.length > 1 && (
            <BlogCategoryFilter
              categories={categories}
              selected={category}
              onSelect={setCategory}
            />
          )}

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="w-full aspect-[16/9] rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
                ))}
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">No posts yet</p>
              <p className="text-sm mt-1">Check back soon for new articles!</p>
            </div>
          ) : (
            <>
              {/* Desktop: 3-column layout | Mobile: stacked */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6">
                {/* Left sidebar — Trending (hidden on mobile) */}
                <aside className="hidden lg:block space-y-1">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
                    Trending
                  </h3>
                  {trendingPosts.map((post, i) => (
                    <BlogSidebarItem key={post.id} post={post} index={i} />
                  ))}
                </aside>

                {/* Hero */}
                {heroPost && <BlogHeroPost post={heroPost} />}

                {/* Right sidebar — Latest (hidden on mobile) */}
                <aside className="hidden lg:block space-y-1">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
                    Latest
                  </h3>
                  {latestPosts.map((post) => (
                    <BlogSidebarItem key={post.id} post={post} />
                  ))}
                </aside>
              </div>

              {/* Grid below */}
              {gridPosts.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-foreground mb-4">More Stories</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gridPosts.map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground mt-12">
          <p>© {new Date().getFullYear()} Teslys. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
