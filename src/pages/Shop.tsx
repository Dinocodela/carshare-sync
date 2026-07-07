import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, Truck, Zap, Sofa, Package } from "lucide-react";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { useCartSync } from "@/hooks/useCartSync";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { ShopBottomNav } from "@/components/shop/ShopBottomNav";
import { cn } from "@/lib/utils";
import heroTesla from "@/assets/shop/hero-tesla.jpg";

const CATEGORIES = ["All", "Charging", "Organization", "Protection", "Comfort", "Exterior"];

const KITS = [
  { label: "Road Trip", subtitle: "Long haul ready", category: "Comfort", icon: Truck },
  { label: "Protection", subtitle: "Shield your Tesla", category: "Protection", icon: ShieldCheck },
  { label: "Charging", subtitle: "Power anywhere", category: "Charging", icon: Zap },
  { label: "Comfort", subtitle: "Ride in ease", category: "Comfort", icon: Sofa },
  { label: "Interior", subtitle: "Stay organized", category: "Organization", icon: Package },
];

type SortKey = "featured" | "price-asc" | "price-desc";

export default function Shop() {
  useCartSync();
  const { data: products, isLoading } = useShopifyProducts();
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const gridRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!products) return [];
    let list =
      category === "All"
        ? [...products]
        : products.filter(
            (p) => (p.node.productType || "").toLowerCase() === category.toLowerCase(),
          );
    if (sort !== "featured") {
      list = list.sort((a, b) => {
        const pa = parseFloat(a.node.priceRange.minVariantPrice.amount);
        const pb = parseFloat(b.node.priceRange.minVariantPrice.amount);
        return sort === "price-asc" ? pa - pb : pb - pa;
      });
    }
    return list;
  }, [products, category, sort]);

  const scrollToGrid = () => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToCategories = () =>
    catRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const selectKit = (cat: string) => {
    setCategory(cat);
    scrollToGrid();
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <SEO
        title="Teslys Shop — Premium Tesla Accessories & Gear"
        description="Shop premium Tesla accessories: chargers, floor mats, organizers, screen protectors and more. Fast shipping, curated for Tesla owners."
        canonical="https://teslys.app/shop"
        ogType="website"
      />

      {/* Header */}
      <nav className="border-b border-border bg-background/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-6 w-auto" />
            <span className="text-sm font-semibold tracking-tight text-foreground">Teslys Shop</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
              Home
            </Link>
            <CartDrawer />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <img
          src={heroTesla}
          alt="Sleek black Tesla with ambient lighting"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/75 to-[#0B1220]/30" />
        <div className="relative max-w-6xl mx-auto px-5 min-h-[380px] md:min-h-[460px] flex flex-col justify-end pb-10 pt-24 md:py-28 md:justify-center animate-fade-in">
          <span className="inline-flex w-fit items-center rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-medium text-white/85 mb-4 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
            Teslys Shop
          </span>
          <h1 className="text-[36px] leading-[1.1] sm:text-5xl md:text-6xl font-bold tracking-tight mb-3 max-w-3xl text-white">
            Elevate Your Tesla Experience
          </h1>
          <p className="text-base md:text-lg text-white/75 max-w-lg mb-6">
            Premium accessories to upgrade, protect, and organize your Tesla.
          </p>
          <Button
            size="default"
            className="rounded-full px-6 w-fit"
            onClick={scrollToGrid}
          >
            Shop Essentials
          </Button>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-[11px] sm:text-xs text-white/60">
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-primary" /> Fast shipping</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure checkout</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Tesla-fit</span>
          </div>
        </div>
      </section>

      {/* Shop by Kit — compact horizontal chips */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <h2 className="text-base font-semibold tracking-tight mb-3">Shop by Kit</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {KITS.map((kit) => (
            <button
              key={kit.label}
              onClick={() => selectKit(kit.category)}
              className="group shrink-0 w-[130px] text-left bg-card border border-border rounded-xl p-3 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <kit.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-[13px] font-semibold leading-tight">{kit.label}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{kit.subtitle}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Category + sort bar */}
      <div
        ref={catRef}
        className="sticky top-16 z-40 bg-background/90 backdrop-blur-xl border-y border-border mt-2"
      >
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium border transition-colors",
                  category === c
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[120px] shrink-0 h-8 rounded-full text-[13px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <section className="py-5" ref={gridRef}>
        <div className="max-w-6xl mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {filtered.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t py-6 mt-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/support" className="hover:text-foreground">Support</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
        </div>
      </footer>

      <ShopBottomNav onCategories={scrollToCategories} />
    </div>
  );
}
