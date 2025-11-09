import { useEffect } from "react";

interface StructuredDataProps {
  type: "organization" | "website" | "service" | "faq" | "software" | "breadcrumblist";
  data?: Record<string, any>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const scriptId = `structured-data-${type}`;
    const existingScript = document.getElementById(scriptId);
    
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.text = JSON.stringify(getStructuredData(type, data));
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);

  return null;
}

function getStructuredData(type: string, customData?: Record<string, any>) {
  const baseUrl = "https://teslys.app";

  switch (type) {
    case "organization":
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Teslys",
        url: baseUrl,
        logo: `${baseUrl}/icons/icon-512.webp`,
        description:
          "Premium Tesla car sharing platform. We handle rentals, cleaning, and guest support so you can earn passive income from your Tesla.",
        sameAs: [
          "https://apps.apple.com/us/app/teslys/id6751721668",
          "https://play.google.com/store/apps/details?id=com.app.teslys",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Customer Support",
          email: "support@teslys.app",
        },
        ...customData,
      };

    case "website":
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Teslys - Tesla Car Sharing Platform",
        url: baseUrl,
        description:
          "Turn your Tesla into a passive income stream with Teslys car sharing. We handle everything—rentals, cleaning, and guest support.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        ...customData,
      };

    case "service":
      return {
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: "Tesla Car Sharing",
        name: "Teslys Tesla Car Sharing Service",
        provider: {
          "@type": "Organization",
          name: "Teslys",
          url: baseUrl,
        },
        description:
          "Full-service Tesla car sharing platform. We handle rentals, cleaning, maintenance scheduling, and 24/7 guest support so you can earn passive income while you sleep.",
        areaServed: {
          "@type": "Place",
          name: "United States",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Tesla Car Sharing Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Host Tesla Rental Management",
                description:
                  "Complete rental management for Tesla owners including guest screening, cleaning coordination, and maintenance scheduling.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Client Tesla Rental Access",
                description:
                  "Access and manage your rented Tesla vehicles with real-time analytics and expense tracking.",
              },
            },
          ],
        },
        ...customData,
      };

    case "software":
      return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Teslys",
        applicationCategory: "BusinessApplication",
        operatingSystem: "iOS, Android, Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "150",
        },
        description:
          "Premium Tesla car sharing platform. Manage rentals, track earnings, and handle everything from one app.",
        downloadUrl: [
          "https://apps.apple.com/us/app/teslys/id6751721668",
          "https://play.google.com/store/apps/details?id=com.app.teslys",
        ],
        ...customData,
      };

    case "faq":
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: customData?.questions || [],
      };

    case "breadcrumblist":
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: customData?.itemListElement || [],
      };

    default:
      return {};
  }
}
