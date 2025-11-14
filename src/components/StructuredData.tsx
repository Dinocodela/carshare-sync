import { useEffect } from "react";

interface StructuredDataProps {
  type: "organization" | "website" | "service" | "faq" | "software" | "breadcrumblist" | "localbusiness" | "aggregaterating";
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

    case "localbusiness":
      return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Teslys",
        image: `${baseUrl}/icons/icon-512.webp`,
        "@id": baseUrl,
        url: baseUrl,
        telephone: "+1-555-TESLYS1",
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: "123 Electric Avenue",
          addressLocality: "San Francisco",
          addressRegion: "CA",
          postalCode: "94102",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "18:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Saturday"],
            opens: "10:00",
            closes: "16:00",
          },
        ],
        sameAs: [
          "https://www.facebook.com/teslys",
          "https://twitter.com/teslys",
          "https://www.linkedin.com/company/teslys",
          "https://www.instagram.com/teslys",
          "https://apps.apple.com/us/app/teslys/id6751721668",
          "https://play.google.com/store/apps/details?id=com.app.teslys",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+1-555-TESLYS1",
          contactType: "customer service",
          email: "support@teslys.app",
          areaServed: "US",
          availableLanguage: ["English"],
        },
        areaServed: [
          {
            "@type": "State",
            name: "California",
          },
          {
            "@type": "State",
            name: "New York",
          },
          {
            "@type": "State",
            name: "Texas",
          },
          {
            "@type": "State",
            name: "Florida",
          },
          {
            "@type": "Country",
            name: "United States",
          },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Tesla Car Sharing Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Tesla Model 3 Rental",
                description: "Rent your Tesla Model 3 through our platform and earn passive income",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Tesla Model Y Rental",
                description: "Rent your Tesla Model Y through our platform and earn passive income",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Full Rental Management",
                description: "Complete rental management including cleaning, guest support, and maintenance coordination",
              },
            },
          ],
        },
        aggregateRating: customData?.aggregateRating || {
          "@type": "AggregateRating",
          ratingValue: "5.0",
          reviewCount: "4",
        },
        review: customData?.reviews || [],
        ...customData,
      };

    case "aggregaterating":
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Teslys Tesla Car Sharing Service",
        description: "Premium Tesla car sharing platform with full rental management",
        image: `${baseUrl}/og-image.jpg`,
        brand: {
          "@type": "Brand",
          name: "Teslys",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: customData?.ratingValue || "5.0",
          reviewCount: customData?.reviewCount || 4,
          bestRating: "5",
          worstRating: "1",
        },
        review: customData?.reviews || [],
      };

    default:
      return {};
  }
}
