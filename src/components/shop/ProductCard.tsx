import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Heart, Loader2, Plus, ShoppingCart } from "lucide-react";
import { ShopifyProduct } from "@/lib/shopify/storefront";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const wishlisted = useWishlistStore((s) => s.ids.includes(product.node.id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const [added, setAdded] = useState(false);

  const node = product.node;
  const images = node.images?.edges ?? [];
  const image = images[0]?.node;
  const hoverImage = images[1]?.node;
  const variant = node.variants?.edges?.[0]?.node;
  const price = node.priceRange.minVariantPrice;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWish(node.id);
  };

  return (
    <Link
      to={`/shop/${node.handle}`}
      className="group relative bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:border-primary/40 hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-[4/5] bg-muted/30 overflow-hidden">
        {image ? (
          <>
            <img
              src={image.url}
              alt={image.altText || node.title}
              loading="lazy"
              width={400}
              height={500}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
                hoverImage && "group-hover:opacity-0",
              )}
            />
            {hoverImage && (
              <img
                src={hoverImage.url}
                alt={hoverImage.altText || node.title}
                loading="lazy"
                width={400}
                height={500}
                className="absolute inset-0 w-full h-full object-cover opacity-0 scale-105 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-8 w-8" />
          </div>
        )}

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWish}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              wishlisted ? "fill-destructive text-destructive" : "text-foreground",
            )}
          />
        </button>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-medium text-[13px] sm:text-sm leading-snug line-clamp-2 min-h-[2.4em]">
          {node.title}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm sm:text-base font-semibold tracking-tight">
            {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
          </span>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full shrink-0"
            aria-label="Add to cart"
            onClick={handleAddToCart}
            disabled={isLoading || !variant}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : added ? (
              <Check className="h-3.5 w-3.5 text-primary animate-scale-in" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
