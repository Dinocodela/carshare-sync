// Single source of truth for which Teslas we currently accept for hosting.
// Update these rules to change eligibility everywhere (notice + validation).

export interface EligibilityRule {
  model: string;
  minYear: number;
}

export const ELIGIBILITY_RULES: EligibilityRule[] = [
  { model: "Model X", minYear: 2022 },
  { model: "Cybertruck", minYear: 2024 },
  { model: "Model Y", minYear: 2026 },
  { model: "Model 3", minYear: 2026 },
];

// Models we accept (used to constrain the Add Car model select).
export const ACCEPTED_MODELS = ELIGIBILITY_RULES.map((r) => r.model);

// Human-readable list, e.g. "Model X (2022 & newer)".
export const ELIGIBILITY_ITEMS = ELIGIBILITY_RULES.map(
  (r) => `${r.model} (${r.minYear} & newer)`
);

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Determine whether a vehicle meets the current hosting criteria.
 * We only accept Teslas that match a specific model + minimum year.
 */
export function checkTeslaEligibility(
  make: string,
  model: string,
  year: number
): EligibilityResult {
  const normalizedMake = normalize(make);
  if (normalizedMake !== "tesla") {
    return {
      eligible: false,
      reason:
        "We're currently only accepting select Tesla models. Other makes aren't eligible at this time.",
    };
  }

  const normalizedModel = normalize(model);
  const rule = ELIGIBILITY_RULES.find(
    (r) => normalize(r.model) === normalizedModel
  );

  if (!rule) {
    return {
      eligible: false,
      reason: `We're not accepting ${model.trim() || "this model"} right now. We currently accept: ${ELIGIBILITY_ITEMS.join(", ")}.`,
    };
  }

  if (!year || year < rule.minYear) {
    return {
      eligible: false,
      reason: `We're only accepting ${rule.model} from ${rule.minYear} and newer right now.`,
    };
  }

  return { eligible: true };
}
