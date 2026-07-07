import { Link } from "react-router-dom";
import { ShopifyProduct } from "@/lib/shopify/storefront";

export function RelatedProducts({
  products,
  currentHandle,
  productType,
}: {
  products: ShopifyProduct[];
  currentHandle: string;
  productType?: string;
}) {
  const related = products
    .filter((p) => p.node.handle !== currentHandle)
    .sort((a, b) => {
      const aMatch = productType && a.node.productType === productType ? 0 : 1;
      const bMatch = productType && b.node.productType === productType ? 0 : 1;
      return aMatch - bMatch;
    })
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold mb-5">You might also like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {related.map((p) => {
          const img = p.node.images?.edges?.[0]?.node;
          const price = p.node.priceRange.minVariantPrice;
          return (
            <Link
              key={p.node.id}
              to={`/shop/${p.node.handle}`}
              className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/60 hover:shadow-elegant transition-all"
            >
              <div className="aspect-square bg-muted/40 overflow-hidden">
                {img && (
                  <img
                    src={img.url}
                    alt={img.altText || p.node.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold line-clamp-1">{p.node.title}</h3>
                <p className="text-sm font-bold mt-1">
                  {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
