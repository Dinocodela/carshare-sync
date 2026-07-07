import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Truck, Zap } from "lucide-react";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { useCartSync } from "@/hooks/useCartSync";
import { ProductCard } from "@/components/shop/ProductCard";
import { CartDrawer } from "@/components/shop/CartDrawer";

const CATEGORIES = ["All", "Charging", "Organization", "Protection", "Comfort", "Exterior"];

export default function Shop() {
  useCartSync();
  const { data: products, isLoading } = useShopifyProducts();
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    if (!products) return [];
    if (category === "All") return products;
    return products.filter(
      (p) => (p.node.productType || "").toLowerCase() === category.toLowerCase(),
    );
  }, [products, category]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Teslys Shop — Tesla Accessories & Gear"
        description="Shop premium Tesla accessories: chargers, floor mats, organizers, screen protectors and more. Fast shipping, curated for Tesla owners."
        canonical="https://teslys.app/shop"
        ogType="website"
      />

      <nav className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
              Home
            </Link>
            <CartDrawer />
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-b from-primary/5 to-background py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            Teslys Shop
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Accessories Built for Tesla Owners
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Curated gear to upgrade, protect, and organize your Tesla — shipped straight to your door.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Fast shipping</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure checkout</span>
            <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Tesla-fit selection</span>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                variant={category === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-muted-foreground mt-2">
                {category === "All"
                  ? "Check back soon — new products are on the way."
                  : "No products in this category yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/support" className="hover:text-foreground">Support</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
