import { useState } from "react";
import { Car, ChevronDown } from "lucide-react";

interface VehicleRevealProps {
  make: string;
  model: string;
  year: number | string;
  color: string;
  license_plate?: string | null;
  vin_number?: string | null;
}

/**
 * Compact tap-to-reveal vehicle details. Shows a small car icon chip by default;
 * tapping expands the full make/model/year/color/plate/VIN block inline.
 */
export function VehicleReveal({
  make,
  model,
  year,
  color,
  license_plate,
  vin_number,
}: VehicleRevealProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground active:scale-95"
        aria-expanded={open}
      >
        <Car className="h-3 w-3 shrink-0" />
        <span>Vehicle</span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-1.5 rounded-xl border border-border/40 bg-background/50 p-2.5 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Make:</span>{" "}
              {make || "N/A"}
            </div>
            <div>
              <span className="text-muted-foreground">Model:</span>{" "}
              {model || "N/A"}
            </div>
            <div>
              <span className="text-muted-foreground">Year:</span>{" "}
              {year || "N/A"}
            </div>
            <div>
              <span className="text-muted-foreground">Color:</span>{" "}
              {color || "N/A"}
            </div>
            <div>
              <span className="text-muted-foreground">License:</span>{" "}
              {license_plate || "N/A"}
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">VIN:</span>{" "}
              {vin_number || "N/A"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
