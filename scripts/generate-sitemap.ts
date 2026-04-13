import { writeFileSync } from "fs";
import { modelCityPages } from "../src/data/modelCityPages";

const BASE_URL = "https://teslys.app";
const today = new Date().toISOString().split("T")[0];

interface SitemapEntry {
  loc: string;
  changefreq: string;
  priority: string;
}

const staticPages: SitemapEntry[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/get-started", changefreq: "monthly", priority: "0.9" },
  { loc: "/how-it-works", changefreq: "monthly", priority: "0.9" },
  { loc: "/about", changefreq: "monthly", priority: "0.8" },
  { loc: "/blog", changefreq: "daily", priority: "0.9" },
  { loc: "/faq", changefreq: "monthly", priority: "0.8" },
  { loc: "/register/client", changefreq: "monthly", priority: "0.8" },
  { loc: "/register/host", changefreq: "monthly", priority: "0.8" },
  { loc: "/earnings-calculator", changefreq: "monthly", priority: "0.8" },
  { loc: "/turo-management", changefreq: "monthly", priority: "0.9" },
  { loc: "/how-much-can-i-earn", changefreq: "monthly", priority: "0.9" },
  { loc: "/military", changefreq: "monthly", priority: "0.9" },
  { loc: "/support", changefreq: "monthly", priority: "0.6" },
  { loc: "/privacy", changefreq: "monthly", priority: "0.5" },
  { loc: "/terms", changefreq: "monthly", priority: "0.5" },
];

const intentPages: SitemapEntry[] = [
  { loc: "/tesla-monthly-rental", changefreq: "monthly", priority: "0.9" },
  { loc: "/tesla-rental-cost", changefreq: "monthly", priority: "0.9" },
  { loc: "/tesla-rental-near-me", changefreq: "monthly", priority: "0.9" },
  { loc: "/tesla-rental-insurance", changefreq: "monthly", priority: "0.8" },
  { loc: "/tesla-rental-statistics", changefreq: "quarterly", priority: "0.8" },
];

const modelPages: SitemapEntry[] = [
  { loc: "/tesla-cybertruck-rental", changefreq: "monthly", priority: "0.9" },
  { loc: "/tesla-model-x-rental", changefreq: "monthly", priority: "0.9" },
  { loc: "/tesla-model-s-rental", changefreq: "monthly", priority: "0.9" },
];

const cities = [
  "los-angeles", "miami", "san-francisco", "new-york", "austin",
  "san-diego", "dallas", "chicago", "seattle", "denver",
  "phoenix", "atlanta", "las-vegas", "oklahoma-city",
];

const cityPages: SitemapEntry[] = cities.map((c) => ({
  loc: `/tesla-car-sharing-${c}`,
  changefreq: "monthly",
  priority: "0.9",
}));

const programmaticPages: SitemapEntry[] = modelCityPages.map((p) => ({
  loc: `/${p.slug}`,
  changefreq: "monthly",
  priority: "0.8",
}));

const allPages = [
  ...staticPages,
  ...intentPages,
  ...modelPages,
  ...cityPages,
  ...programmaticPages,
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) =>
      `  <url><loc>${BASE_URL}${p.loc}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
  )
  .join("\n")}
</urlset>`;

writeFileSync("public/sitemap.xml", xml);
console.log(`✅ Sitemap generated with ${allPages.length} URLs`);
