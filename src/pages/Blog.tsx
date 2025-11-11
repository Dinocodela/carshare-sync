import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { BlogCard } from "@/components/blog/BlogCard";
import { NewsletterSignup } from "@/components/blog/NewsletterSignup";
import { blogPosts, getAllCategories } from "@/data/blogPosts";
import { Button } from "@/components/ui/button";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const categories = ["All", ...getAllCategories()];

  const filteredPosts =
    selectedCategory === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  return (
    <>
      <SEO
        title="Teslys Blog - Tesla Car Sharing Tips, Guides & Passive Income Strategies"
        description="Expert guides on Tesla car sharing, passive income generation, rental management, and vehicle maintenance. Learn how to maximize your Tesla rental earnings."
        keywords="Tesla car sharing blog, Tesla rental tips, passive income strategies, Tesla maintenance guide, car sharing success"
        canonical="https://teslys.app/blog"
      />
      <StructuredData type="website" />

      <DashboardLayout>
        <PageContainer>
          <ScreenHeader
            title="Blog"
          />

          {/* Newsletter Signup */}
          <NewsletterSignup />

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No posts found in this category.
              </p>
            </div>
          )}
        </PageContainer>
      </DashboardLayout>
    </>
  );
}
