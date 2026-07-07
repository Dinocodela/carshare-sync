import { Link } from "react-router-dom";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

const itemClass =
  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors";

export function ShopBottomNav({ onCategories }: { onCategories?: () => void }) {
  const totalItems = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 h-16 bg-background/95 backdrop-blur border-t border-border/60 flex items-stretch px-2 pb-safe-bottom"
      aria-label="Shop navigation"
    >
      <Link to="/" className={itemClass}>
        <Home className="h-5 w-5" />
        Home
      </Link>
      <button type="button" onClick={onCategories} className={itemClass}>
        <LayoutGrid className="h-5 w-5" />
        Categories
      </button>
      <CartDrawer
        trigger={
          <button type="button" className={cn(itemClass, "relative")}>
            <span className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center animate-cart-bounce">
                  {totalItems}
                </span>
              )}
            </span>
            Cart
          </button>
        }
      />
      <Link to="/login" className={itemClass}>
        <User className="h-5 w-5" />
        Account
      </Link>
    </nav>
  );
}
