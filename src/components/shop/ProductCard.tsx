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
      className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden flex flex-col hover:border-primary/60 hover:shadow-elegant transition-all duration-300"
    >
      <div className="relative aspect-square bg-muted/40 overflow-hidden">
        {image ? (
          <>
            <img
              src={image.url}
              alt={image.altText || node.title}
              loading="lazy"
              width={600}
              height={600}
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
                width={600}
                height={600}
                className="absolute inset-0 w-full h-full object-cover opacity-0 scale-105 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10" />
          </div>
        )}

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWish}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2.5 right-2.5 h-9 w-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              wishlisted ? "fill-destructive text-destructive" : "text-foreground",
            )}
          />
        </button>

        {/* Quick add (desktop hover) */}
        <div className="absolute inset-x-2.5 bottom-2.5 hidden sm:block opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Button
            size="sm"
            className="w-full rounded-full"
            onClick={handleAddToCart}
            disabled={isLoading || !variant}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : added ? (
              <><Check className="h-4 w-4 mr-1" /> Added</>
            ) : (
              <><ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart</>
            )}
          </Button>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2">{node.title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">{node.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-base sm:text-lg font-bold">
            {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
          </span>
          {/* Compact add button (mobile within thumb reach) */}
          <Button
            size="icon"
            className="h-10 w-10 rounded-full shrink-0 sm:hidden"
            aria-label="Add to cart"
            onClick={handleAddToCart}
            disabled={isLoading || !variant}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : added ? (
              <Check className="h-4 w-4 animate-scale-in" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
