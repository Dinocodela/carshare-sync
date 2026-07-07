import { Link } from "react-router-dom";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

const itemClass =
  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium tracking-tight text-muted-foreground hover:text-foreground transition-colors";

export function ShopBottomNav({ onCategories }: { onCategories?: () => void }) {
  const totalItems = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 h-14 bg-background/90 backdrop-blur-xl border-t border-border flex items-stretch px-1 pb-safe-bottom"
      aria-label="Shop navigation"
    >
      <Link to="/" className={itemClass}>
        <Home className="h-[18px] w-[18px]" />
        Home
      </Link>
      <button type="button" onClick={onCategories} className={itemClass}>
        <LayoutGrid className="h-[18px] w-[18px]" />
        Categories
      </button>
      <CartDrawer
        trigger={
          <button type="button" className={cn(itemClass, "relative")}>
            <span className="relative">
              <ShoppingCart className="h-[18px] w-[18px]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </span>
            Cart
          </button>
        }
      />
      <Link to="/login" className={itemClass}>
        <User className="h-[18px] w-[18px]" />
        Account
      </Link>
    </nav>
  );
}
