export interface ModelCityData {
  slug: string;
  model: string;
  modelShort: string;
  city: string;
  state: string;
  stateCode: string;
  metaTitle: string;
  metaDescription: string;
  avgMonthlyEarnings: string;
  avgDailyRate: string;
  modelHighlight: string;
  cityInsight: string;
  popularNeighborhoods: string[];
}

const models = [
  {
    model: "Tesla Model 3",
    modelShort: "Model 3",
    slugPart: "tesla-model-3",
    earningsRange: ["$1,200", "$1,400", "$1,300", "$1,500", "$1,100", "$1,350"],
    dailyRange: ["$85", "$95", "$90", "$100", "$80", "$88"],
    highlight:
      "The Model 3 is the most popular Tesla on rental platforms — affordable to own, low operating costs, and consistently high demand from budget-conscious renters and business travelers alike.",
  },
  {
    model: "Tesla Model Y",
    modelShort: "Model Y",
    slugPart: "tesla-model-y",
    earningsRange: ["$1,500", "$1,700", "$1,600", "$1,800", "$1,400", "$1,550"],
    dailyRange: ["$105", "$120", "$110", "$130", "$100", "$108"],
    highlight:
      "The Model Y commands premium daily rates thanks to its SUV practicality and family-friendly space. It's the top earner on Turo for Tesla owners who want maximum return per vehicle.",
  },
];

const cities = [
  {
    city: "Los Angeles",
    state: "California",
    stateCode: "CA",
    slugPart: "los-angeles",
    insight: "LA's year-round sunshine, tourism, and entertainment industry create non-stop demand for Tesla rentals. Airport pickups at LAX and weekend trips to Palm Springs keep bookings flowing.",
    neighborhoods: ["Santa Monica", "Hollywood", "Downtown LA", "Beverly Hills", "Venice", "Pasadena"],
  },
  {
    city: "Miami",
    state: "Florida",
    stateCode: "FL",
    slugPart: "miami",
    insight: "Miami's luxury lifestyle, Art Basel, and year-round warm weather make it a top market for Tesla rentals. Snowbird season (Nov–Apr) drives peak demand with premium pricing.",
    neighborhoods: ["South Beach", "Brickell", "Wynwood", "Coconut Grove", "Coral Gables", "Downtown Miami"],
  },
  {
    city: "San Francisco",
    state: "California",
    stateCode: "CA",
    slugPart: "san-francisco",
    insight: "The Bay Area's tech-savvy travelers and eco-conscious culture make Tesla the preferred rental choice. High corporate travel demand and weekend wine country trips boost earnings.",
    neighborhoods: ["SOMA", "Marina District", "Mission District", "Pacific Heights", "North Beach", "Castro"],
  },
  {
    city: "Austin",
    state: "Texas",
    stateCode: "TX",
    slugPart: "austin",
    insight: "Austin's explosive growth, SXSW, Formula 1, and a booming tech scene create surging demand for Tesla rentals. No state income tax means more of your earnings stay with you.",
    neighborhoods: ["Downtown Austin", "East Austin", "South Congress", "Domain", "Zilker", "Mueller"],
  },
  {
    city: "New York",
    state: "New York",
    stateCode: "NY",
    slugPart: "new-york",
    insight: "NYC's massive visitor base and limited parking make Tesla rentals attractive for weekend getaways, airport transfers, and business travel across the tri-state area.",
    neighborhoods: ["Manhattan", "Brooklyn", "Queens", "Hoboken", "Jersey City", "Long Island City"],
  },
  {
    city: "Dallas",
    state: "Texas",
    stateCode: "TX",
    slugPart: "dallas",
    insight: "DFW's business travel scene, major sports events, and sprawling metro area create consistent Tesla rental demand. No state income tax maximizes your take-home earnings.",
    neighborhoods: ["Uptown Dallas", "Deep Ellum", "Frisco", "Plano", "Arlington", "Fort Worth"],
  },
];

export const modelCityPages: ModelCityData[] = [];

models.forEach((m, mi) => {
  cities.forEach((c, ci) => {
    modelCityPages.push({
      slug: `${m.slugPart}-rental-income-${c.slugPart}`,
      model: m.model,
      modelShort: m.modelShort,
      city: c.city,
      state: c.state,
      stateCode: c.stateCode,
      metaTitle: `${m.model} Rental Income in ${c.city} | Teslys`,
      metaDescription: `How much can you earn renting your ${m.model} in ${c.city}, ${c.stateCode}? See real earnings data, tips, and get started with Teslys today.`,
      avgMonthlyEarnings: m.earningsRange[ci % m.earningsRange.length],
      avgDailyRate: m.dailyRange[ci % m.dailyRange.length],
      modelHighlight: m.highlight,
      cityInsight: c.insight,
      popularNeighborhoods: c.neighborhoods,
    });
  });
});
