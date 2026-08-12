import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgePercent, Car, PiggyBank, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackWrapEvent } from "@/lib/wrapAnalytics";
import { TeslaDealDialog } from "./TeslaDealDialog";

const RENT_URL = "https://app.eonrides.com/";
const REFERRAL_URL = "http://ts.la/walter46402";

interface WrapsOffersProps {
  source: string;
}

/**
 * Monetization band shown under the free wrap content — turns Instagram
 * traffic into rental, hosting and Tesla-purchase leads.
 */
export function WrapsOffers({ source }: WrapsOffersProps) {
  const [dealOpen, setDealOpen] = useState(false);

  const track = (offer: string) => trackWrapEvent("wrap_offer_click", { offer, source });

  return (
    <section className="max-w-6xl mx-auto px-6" aria-label="More from Teslys">
      <div className="rounded-3xl border border-sand-border bg-sand-card p-6 sm:p-10 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em]">
            While you're here
          </span>
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          More ways Teslys can help
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          The wraps are free — always. If you're driving, buying, or thinking
          about putting your Tesla to work, we can help with that too.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Rent */}
          <div className="flex flex-col rounded-2xl border border-sand-border bg-sand p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Car className="h-4 w-4 text-primary" />
            </span>
            <h3 className="mt-4 font-semibold text-foreground">Rent a Tesla</h3>
            <p className="mt-1 text-sm text-muted-foreground flex-1">
              Book a Tesla in Los Angeles — delivery, charging and support
              handled.
            </p>
            <a
              href={RENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("rent")}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Browse cars <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Host */}
          <div className="flex flex-col rounded-2xl border border-sand-border bg-sand p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <PiggyBank className="h-4 w-4 text-primary" />
            </span>
            <h3 className="mt-4 font-semibold text-foreground">
              Make money with your Tesla
            </h3>
            <p className="mt-1 text-sm text-muted-foreground flex-1">
              We manage the listing, the guests and the cleaning. See what your
              car could earn.
            </p>
            <Link
              to="/"
              onClick={() => track("host")}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Referral */}
          <div className="flex flex-col rounded-2xl border border-sand-border bg-sand p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </span>
            <h3 className="mt-4 font-semibold text-foreground">
              Buying a new Tesla?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground flex-1">
              Order through our referral link — Tesla's current program includes
              3 months of Full Self-Driving (Supervised).
            </p>
            <a
              href={REFERRAL_URL}
              target="_blank"
              rel="noopener nofollow noreferrer"
              onClick={() => track("referral")}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Use our referral link <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Discount */}
          <div className="flex flex-col rounded-2xl border border-sand-border bg-sand p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <BadgePercent className="h-4 w-4 text-primary" />
            </span>
            <h3 className="mt-4 font-semibold text-foreground">
              Want a better deal?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground flex-1">
              We can connect you with a Tesla sales contact — end-of-quarter
              inventory is usually where the savings are.
            </p>
            <Button
              variant="link"
              className="mt-4 h-auto justify-start p-0 text-sm font-medium"
              onClick={() => {
                track("discount");
                setDealOpen(true);
              }}
            >
              Connect me <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          Teslys is not affiliated with, endorsed by, or sponsored by Tesla,
          Inc. Referral rewards are set by Tesla and can change at any time. We
          can make an introduction only — we cannot guarantee any specific
          discount, price, or availability.
        </p>
      </div>

      <TeslaDealDialog open={dealOpen} onOpenChange={setDealOpen} source={source} />
    </section>
  );
}
