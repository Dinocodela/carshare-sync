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
import { ShieldCheck, Truck, Zap } from "lucide-react";
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
  {
    label: "Road Trip Kit",
    description: "Everything for the long haul",
    category: "Comfort",
    icon: Truck,
  },
  {
    label: "Winter Protection Kit",
    description: "Shield your Tesla from the elements",
    category: "Protection",
    icon: ShieldCheck,
  },
  {
    label: "Charging Essentials",
    description: "Power up anywhere",
    category: "Charging",
    icon: Zap,
  },
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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEO
        title="Teslys Shop — Premium Tesla Accessories & Gear"
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

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <img
          src={heroTesla}
          alt="Sleek black Tesla with ambient lighting"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36 text-center animate-fade-in">
          <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs sm:text-sm font-medium text-white/90 mb-5 backdrop-blur">
            Teslys Shop
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 max-w-3xl mx-auto text-white">
            Elevate Your Tesla Experience
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto mb-8">
            Premium accessories to upgrade, protect, and organize your Tesla — shipped straight to your door.
          </p>
          <Button size="lg" className="rounded-full px-8 shadow-glow" onClick={scrollToGrid}>
            Shop Featured Products
          </Button>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-xs sm:text-sm text-white/70">
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Fast shipping</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure checkout</span>
            <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Tesla-fit selection</span>
          </div>
        </div>

      </section>

      {/* Curated kits */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl md:text-2xl font-bold mb-5">Shop by Kit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {KITS.map((kit) => (
            <button
              key={kit.label}
              onClick={() => selectKit(kit.category)}
              className="group text-left bg-gradient-card border border-border/60 rounded-2xl p-5 hover:border-primary/60 hover:shadow-elegant transition-all"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <kit.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{kit.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{kit.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Category + sort bar */}
      <div
        ref={catRef}
        className="sticky top-[57px] z-40 bg-background/95 backdrop-blur border-y border-border/50"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
                  category === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary/40",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[140px] shrink-0 h-9 rounded-full text-sm">
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

      <section className="py-8" ref={gridRef}>
        <div className="max-w-6xl mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t py-8 mt-8 mb-4">
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
