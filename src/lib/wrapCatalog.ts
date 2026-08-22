import {
  COMPATIBILITY,
  WRAP_PLACEHOLDER,
  Wrap,
  WrapCategory,
  wrapImageUrl,
  wrapPreviewUrl,
  wraps as staticWraps,
} from "@/data/wraps";
import { getTemplate, templateDisplayModel } from "@/lib/wrapTemplates";
import type { Tables } from "@/integrations/supabase/types";

/** A wrap ready to render: static catalog fields plus fully-resolved URLs. */
export type CatalogWrap = Wrap & {
  imageUrl: string;
  previewUrl: string;
  /** Template key the artwork was built against (e.g. modely-2025-premium). */
  templateKey: string;
};

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wrap-file`;

/** Public URL for a file stored in the private `wraps` bucket. */
export const storageFileUrl = (path: string) =>
  `${FUNCTIONS_BASE}?path=${encodeURIComponent(path)}`;

const resolvePath = (path: string | null, kind: string, fallback: string) => {
  if (!path) return fallback;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return kind === "storage" ? storageFileUrl(path) : `/${path}`;
};

export const staticToCatalog = (wrap: Wrap): CatalogWrap => ({
  ...wrap,
  imageUrl: wrapImageUrl(wrap),
  previewUrl: wrapPreviewUrl(wrap),
  templateKey: "modely-2025-premium",
});

export const rowToCatalog = (row: Tables<"wrap_designs">): CatalogWrap => {
  const filename = row.png_path.split("/").pop() ?? `${row.slug}.png`;
  const previewFilename = row.preview_path?.split("/").pop() ?? filename;
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: (row.category as WrapCategory) ?? "Featured",
    modelKey: templateDisplayModel(row.model_key),
    templateKey: row.model_key,
    price: "Free",
    compatibility:
      row.compatibility ||
      (row.model_key ? getTemplate(row.model_key).label : COMPATIBILITY),
    dimensions: row.dimensions,
    fileSize: row.file_size,
    filename,
    previewFilename,
    imageUrl: resolvePath(row.png_path, row.storage_kind, WRAP_PLACEHOLDER),
    previewUrl: resolvePath(
      row.preview_path,
      row.storage_kind,
      resolvePath(row.png_path, row.storage_kind, WRAP_PLACEHOLDER)
    ),
  };
};

/** Offline fallback used until the database responds (or if it fails). */
export const fallbackCatalog: CatalogWrap[] = staticWraps.map(staticToCatalog);

export const getRelatedCatalogWraps = (
  all: CatalogWrap[],
  wrap: CatalogWrap,
  limit = 3
) =>
  all
    .filter((w) => w.slug !== wrap.slug && w.category === wrap.category)
    .concat(all.filter((w) => w.slug !== wrap.slug && w.category !== wrap.category))
    .slice(0, limit);
