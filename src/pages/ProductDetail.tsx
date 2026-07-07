import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Loader2, ShieldCheck, Truck } from "lucide-react";
import { useShopifyProduct, useShopifyProducts } from "@/hooks/useShopifyProducts";
import { useCartSync } from "@/hooks/useCartSync";
import { useCartStore } from "@/stores/cartStore";
import { trackViewItem } from "@/lib/shopify/tracking";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { ShopBottomNav } from "@/components/shop/ShopBottomNav";

export default function ProductDetail() {
  useCartSync();
  const { handle } = useParams<{ handle: string }>();
  const { data: product, isLoading } = useShopifyProduct(handle);
  const { data: allProducts } = useShopifyProducts();
  const addItem = useCartStore((s) => s.addItem);
  const isAdding = useCartStore((s) => s.isLoading);
  const [justAdded, setJustAdded] = useState(false);


  const variants = product?.node.variants.edges ?? [];
  const [variantId, setVariantId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.node.id === variantId)?.node ?? variants[0]?.node,
    [variants, variantId],
  );

  useEffect(() => {
    if (product && selectedVariant) {
      trackViewItem({ price: selectedVariant.price, product: { node: product.node } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.node.id]);

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={product ? `${product.node.title} — Teslys Shop` : "Teslys Shop"}
        description={product?.node.description?.slice(0, 155) || "Premium Tesla accessories from Teslys."}
        canonical={handle ? `https://teslys.app/shop/${handle}` : undefined}
        ogType="product"
      />

      <nav className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><Logo className="h-7 w-auto" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">Shop</Link>
            <CartDrawer />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !product ? (
          <div className="text-center py-24">
            <p className="text-lg font-medium">Product not found</p>
            <Link to="/shop"><Button className="mt-4">Browse all products</Button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <div className="aspect-square bg-muted/40 rounded-xl overflow-hidden">
                {product.node.images.edges[activeImage]?.node ? (
                  <img
                    src={product.node.images.edges[activeImage].node.url}
                    alt={product.node.images.edges[activeImage].node.altText || product.node.title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              {product.node.images.edges.length > 1 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {product.node.images.edges.map((img, i) => (
                    <button
                      key={img.node.url}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${i === activeImage ? "border-primary" : "border-transparent"}`}
                    >
                      <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2">{product.node.title}</h1>
              <p className="text-2xl font-bold mb-6">
                {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
              </p>

              {variants.length > 1 && (
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Options</label>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <Button
                        key={v.node.id}
                        variant={selectedVariant?.id === v.node.id ? "default" : "outline"}
                        size="sm"
                        disabled={!v.node.availableForSale}
                        onClick={() => setVariantId(v.node.id)}
                      >
                        {v.node.title}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="w-full mb-4"
                onClick={handleAddToCart}
                disabled={isAdding || !selectedVariant?.availableForSale}
              >
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : selectedVariant?.availableForSale ? "Add to Cart" : "Out of Stock"}
              </Button>

              <div className="flex gap-6 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Fast shipping</span>
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure checkout</span>
              </div>

              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {product.node.description}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
