interface MarketplaceDisclosureProps {
  className?: string;
}

/**
 * Shared, plain-language disclosure clarifying that Teslys is a vehicle
 * management / co-hosting service and that bookings and trip protection are
 * handled by third-party car-sharing marketplaces.
 */
export function MarketplaceDisclosure({ className = "" }: MarketplaceDisclosureProps) {
  return (
    <p className={`text-sm text-muted-foreground leading-relaxed ${className}`}>
      Teslys is a vehicle management and co-hosting service. Rental bookings,
      trip agreements, renter eligibility screening, and trip protection are
      completed through third-party car-sharing marketplaces such as Turo or
      Eon, subject to their terms. Rates shown are marketplace rates, not direct
      Teslys rentals. Actual earnings vary and no earnings are guaranteed.
    </p>
  );
}
