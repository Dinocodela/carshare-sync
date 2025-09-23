// src/pages/TermsOfUse.tsx
import { SEO } from "@/components/SEO";
import { PageContainer } from "@/components/layout/PageContainer";

export default function TermsOfUse() {
  return (
    <>
      <SEO
        title="Terms of Use - Teslys"
        description="Terms of Use for Teslys."
      />
      <PageContainer className="py-8">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
          <h1>Terms of Use</h1>
          <p className="text-muted-foreground">Last updated: 2025-09-22</p>
          <p>These Terms govern your use of the Teslys app and services...</p>
          {/* Keep brief, non-controversial text; link to your full site page if you prefer */}
        </div>
      </PageContainer>
    </>
  );
}
