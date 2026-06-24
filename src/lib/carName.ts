// Standardized car display name used across Teslys.
// Format: "<Model> - <Last 5 of VIN> - <License Plate>"
// e.g. "Model Y - 30117 - 9YYX507"

export interface CarNameParts {
  model?: string | null;
  vin_number?: string | null;
  license_plate?: string | null;
}

export function formatCarName(car: CarNameParts): string {
  const model = (car.model || "").trim() || "Unknown Model";
  const vin = (car.vin_number || "").trim();
  const last5VIN = vin ? vin.slice(-5).toUpperCase() : "N/A";
  const licensePlate = (car.license_plate || "").trim().toUpperCase() || "N/A";
  return `${model} - ${last5VIN} - ${licensePlate}`;
}
