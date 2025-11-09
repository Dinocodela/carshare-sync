import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { getBlogPostBySlug, blogPosts } from "@/data/blogPosts";
import { BlogCard } from "@/components/blog/BlogCard";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <DashboardLayout>
        <PageContainer>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The blog post you're looking for doesn't exist.
            </p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  // Generate Article schema data
  const articleSchema = {
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    datePublished: post.publishDate,
    dateModified: post.modifiedDate || post.publishDate,
    image: `https://teslys.app${post.image}`,
    publisher: {
      "@type": "Organization",
      name: "Teslys",
      logo: {
        "@type": "ImageObject",
        url: "https://teslys.app/icons/icon-512.webp",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://teslys.app/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).length,
  };

  return (
    <>
      <SEO
        title={`${post.title} | Teslys Blog`}
        description={post.description}
        keywords={post.tags.join(", ")}
        canonical={`https://teslys.app/blog/${post.slug}`}
        ogImage={`https://teslys.app${post.image}`}
        ogType="article"
      />
      <StructuredData type="article" data={articleSchema} />

      <DashboardLayout>
        <PageContainer>
          {/* Back Button */}
          <Link to="/blog" className="inline-block mb-6">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* Hero Image */}
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Header */}
          <article className="prose prose-lg max-w-none">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{post.category}</Badge>
                {post.featured && <Badge variant="default">Featured</Badge>}
              </div>
              
              <h1 className="text-4xl font-bold mb-4 text-foreground">
                {post.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6">
                {post.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.publishDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min read</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/90"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }}
            />
          </article>

          {/* CTA Section */}
          <div className="mt-12 p-8 bg-primary/5 rounded-lg border border-primary/10">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of Tesla owners earning passive income through Teslys car sharing.
            </p>
            <div className="flex gap-4">
              <Link to="/register/host">
                <Button size="lg">Start Hosting</Button>
              </Link>
              <Link to="/faq">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.slug} post={relatedPost} />
                ))}
              </div>
            </div>
          )}
        </PageContainer>
      </DashboardLayout>
    </>
  );
}
