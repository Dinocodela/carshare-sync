/**
 * Registry of Tesla's official Paint Shop wrap templates
 * (vendored from github.com/teslamotors/custom-wraps into public/wraps/templates/).
 *
 * Every wrap PNG must match the template's exact pixel size and align with its
 * UV islands, otherwise the artwork lands on the wrong body panels in the car.
 */

import type { TeslaModelKey } from "@/data/wraps";

export interface WrapTemplate {
  /** Folder name under /wraps/templates/ — also the wrap_designs.model_key value. */
  key: string;
  label: string;
  /** Which tab of the public gallery this template belongs to. */
  displayModel: TeslaModelKey;
  width: number;
  height: number;
  /** Human-readable compatibility line shown on the detail page. */
  compatibility: string;
}

export const WRAP_TEMPLATES: WrapTemplate[] = [
  {
    key: "modely-2025-premium",
    label: "Model Y Premium (2025+ Juniper)",
    displayModel: "model-y",
    width: 1024,
    height: 1024,
    compatibility:
      "2025+ Tesla Model Y Premium (Juniper), including 2026 Model Y Premium.",
  },
  {
    key: "modely-2025-base",
    label: "Model Y (2025+ Standard)",
    displayModel: "model-y",
    width: 1024,
    height: 1024,
    compatibility: "2025+ Tesla Model Y (Juniper), standard trim.",
  },
  {
    key: "modely-2025-performance",
    label: "Model Y Performance (2025+)",
    displayModel: "model-y",
    width: 1024,
    height: 1024,
    compatibility: "2025+ Tesla Model Y Performance (Juniper).",
  },
  {
    key: "modely",
    label: "Model Y (pre-2025)",
    displayModel: "model-y",
    width: 1024,
    height: 1024,
    compatibility: "Tesla Model Y built before the 2025 Juniper refresh.",
  },
  {
    key: "modely-l",
    label: "Model Y L",
    displayModel: "model-y",
    width: 1024,
    height: 1024,
    compatibility: "Tesla Model Y L (long-wheelbase six-seat).",
  },
  {
    key: "model3-2024-base",
    label: "Model 3 (2024+ Highland)",
    displayModel: "model-3",
    width: 1024,
    height: 1024,
    compatibility: "2024+ Tesla Model 3 (Highland), standard trim.",
  },
  {
    key: "model3-2024-performance",
    label: "Model 3 Performance (2024+)",
    displayModel: "model-3",
    width: 1024,
    height: 1024,
    compatibility: "2024+ Tesla Model 3 Performance (Highland).",
  },
  {
    key: "model3",
    label: "Model 3 (pre-2024)",
    displayModel: "model-3",
    width: 1024,
    height: 1024,
    compatibility: "Tesla Model 3 built before the 2024 Highland refresh.",
  },
  {
    key: "models-2025-plaid",
    label: "Model S Plaid (2025+)",
    displayModel: "model-s",
    width: 1024,
    height: 1024,
    compatibility: "2025+ Tesla Model S Plaid.",
  },
  {
    key: "models-2021",
    label: "Model S (2021+)",
    displayModel: "model-s",
    width: 1024,
    height: 1024,
    compatibility: "2021+ Tesla Model S.",
  },
  {
    key: "modelx-2021",
    label: "Model X (2021+)",
    displayModel: "model-x",
    width: 1024,
    height: 1024,
    compatibility: "2021+ Tesla Model X.",
  },
  {
    key: "cybertruck",
    label: "Cybertruck",
    displayModel: "cybertruck",
    width: 1024,
    height: 768,
    compatibility: "Tesla Cybertruck (all trims).",
  },
];

export const DEFAULT_TEMPLATE_KEY = "modely-2025-premium";

export const getTemplate = (key: string): WrapTemplate =>
  WRAP_TEMPLATES.find((t) => t.key === key) ??
  WRAP_TEMPLATES.find((t) => t.key === DEFAULT_TEMPLATE_KEY)!;

/** Maps a template key to the public gallery tab it should appear under. */
export const templateDisplayModel = (key: string): TeslaModelKey =>
  getTemplate(key).displayModel;

export const templateImageUrl = (key: string) =>
  `/wraps/templates/${key}/template.png`;

export const templateMaskUrl = (key: string) =>
  `/wraps/templates/${key}/mask.png`;
