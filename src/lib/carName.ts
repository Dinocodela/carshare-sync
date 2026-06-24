// Standardized car display name used across Teslys.
// Default format: "<Model> - <Last 5 of VIN> - <License Plate>"
// e.g. "Model Y - 30117 - 9YYX507"
// If a manual `nickname` (display name) is set — used for cars added
// automatically (e.g. Eon) that don't follow the standard format — it
// takes precedence.

export interface CarNameParts {
  model?: string | null;
  vin_number?: string | null;
  license_plate?: string | null;
  nickname?: string | null;
}

export function formatCarName(car: CarNameParts): string {
  const nickname = (car.nickname || "").trim();
  if (nickname) return nickname;

  const model = (car.model || "").trim() || "Unknown Model";
  const vin = (car.vin_number || "").trim();
  const last5VIN = vin ? vin.slice(-5).toUpperCase() : "N/A";
  const licensePlate = (car.license_plate || "").trim().toUpperCase() || "N/A";
  return `${model} - ${last5VIN} - ${licensePlate}`;
}
