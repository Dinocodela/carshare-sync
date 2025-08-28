import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
}

export function SEO({ title, description, canonical }: SEOProps) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;
    const createdDesc = !metaDesc;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    if (description) metaDesc.setAttribute("content", description);

    // Canonical link
    let linkCanonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    const createdCanon = !linkCanonical;
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonical || window.location.href);

    return () => {
      document.title = prevTitle;
      if (createdDesc && metaDesc && metaDesc.parentElement)
        metaDesc.parentElement.removeChild(metaDesc);
      if (createdCanon && linkCanonical && linkCanonical.parentElement)
        linkCanonical.parentElement.removeChild(linkCanonical);
    };
  }, [title, description, canonical]);

  return null;
}
