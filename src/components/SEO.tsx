import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: "summary" | "summary_large_image";
  noIndex?: boolean;
}

export function SEO({
  title,
  description,
  canonical,
  keywords,
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  noIndex = false,
}: SEOProps) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const createdElements: HTMLElement[] = [];

    // Helper to create or update meta tag
    const setMeta = (
      selector: string,
      attributeName: string,
      attributeValue: string,
      content?: string
    ) => {
      let meta = document.querySelector(selector) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attributeName, attributeValue);
        document.head.appendChild(meta);
        createdElements.push(meta);
      }
      if (content) meta.setAttribute("content", content);
    };

    // Basic meta tags
    if (description) {
      setMeta('meta[name="description"]', "name", "description", description);
    }

    if (keywords) {
      setMeta('meta[name="keywords"]', "name", "keywords", keywords);
    }

    // Robots meta
    if (noIndex) {
      setMeta('meta[name="robots"]', "name", "robots", "noindex, nofollow");
    } else {
      setMeta(
        'meta[name="robots"]',
        "name",
        "robots",
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      );
    }

    // Open Graph meta tags
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    if (description) {
      setMeta(
        'meta[property="og:description"]',
        "property",
        "og:description",
        description
      );
    }
    setMeta('meta[property="og:type"]', "property", "og:type", ogType);
    setMeta(
      'meta[property="og:url"]',
      "property",
      "og:url",
      canonical || window.location.href
    );
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", "Teslys");
    setMeta('meta[property="og:locale"]', "property", "og:locale", "en_US");
    
    if (ogImage) {
      setMeta('meta[property="og:image"]', "property", "og:image", ogImage);
      setMeta(
        'meta[property="og:image:alt"]',
        "property",
        "og:image:alt",
        title
      );
    }

    // Twitter Card meta tags
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", twitterCard);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    if (description) {
      setMeta(
        'meta[name="twitter:description"]',
        "name",
        "twitter:description",
        description
      );
    }
    if (ogImage) {
      setMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);
    }

    // Canonical link
    let linkCanonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
      createdElements.push(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonical || window.location.href);

    return () => {
      document.title = prevTitle;
      createdElements.forEach((el) => {
        if (el.parentElement) {
          el.parentElement.removeChild(el);
        }
      });
    };
  }, [title, description, canonical, keywords, ogImage, ogType, twitterCard, noIndex]);

  return null;
}
