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
    earningsRange: ["$1,200", "$1,400", "$1,300", "$1,500", "$1,100", "$1,350", "$1,250", "$1,450"],
    dailyRange: ["$85", "$95", "$90", "$100", "$80", "$88", "$92", "$98"],
    highlight:
      "The Model 3 is the most popular Tesla on rental platforms — affordable to own, low operating costs, and consistently high demand from budget-conscious renters and business travelers alike.",
  },
  {
    model: "Tesla Model Y",
    modelShort: "Model Y",
    slugPart: "tesla-model-y",
    earningsRange: ["$1,500", "$1,700", "$1,600", "$1,800", "$1,400", "$1,550", "$1,650", "$1,750"],
    dailyRange: ["$105", "$120", "$110", "$130", "$100", "$108", "$115", "$125"],
    highlight:
      "The Model Y commands premium daily rates thanks to its SUV practicality and family-friendly space. It's the top earner on Turo for Tesla owners who want maximum return per vehicle.",
  },
  {
    model: "Tesla Model X",
    modelShort: "Model X",
    slugPart: "tesla-model-x",
    earningsRange: ["$2,000", "$2,300", "$2,100", "$2,500", "$1,900", "$2,150", "$2,200", "$2,400"],
    dailyRange: ["$145", "$165", "$150", "$175", "$140", "$155", "$160", "$170"],
    highlight:
      "The Model X is a luxury SUV with falcon-wing doors, premium interior, and seating for up to 7. It commands the highest daily rates among Tesla models, attracting affluent travelers and families seeking a premium experience.",
  },
  {
    model: "Tesla Model S",
    modelShort: "Model S",
    slugPart: "tesla-model-s",
    earningsRange: ["$1,800", "$2,100", "$1,900", "$2,200", "$1,700", "$1,950", "$2,000", "$2,150"],
    dailyRange: ["$130", "$150", "$135", "$160", "$125", "$140", "$145", "$155"],
    highlight:
      "The Model S is Tesla's flagship sedan — a performance luxury vehicle that appeals to high-end renters. With its premium positioning and impressive range, it attracts business executives and car enthusiasts willing to pay top dollar.",
  },
  {
    model: "Tesla Cybertruck",
    modelShort: "Cybertruck",
    slugPart: "tesla-cybertruck",
    earningsRange: ["$2,500", "$2,800", "$2,600", "$3,000", "$2,400", "$2,700", "$2,650", "$2,900"],
    dailyRange: ["$175", "$200", "$185", "$220", "$170", "$190", "$195", "$210"],
    highlight:
      "The Cybertruck is Tesla's most talked-about vehicle — its futuristic design and novelty factor drive massive rental demand. Early Cybertruck listings on Turo command the highest daily rates of any Tesla, making it a top earner for hosts.",
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
  {
    city: "Las Vegas",
    state: "Nevada",
    stateCode: "NV",
    slugPart: "las-vegas",
    insight: "Las Vegas attracts over 40 million visitors annually, making it one of the strongest rental markets in the country. Tesla rentals are especially popular for Strip cruising, Red Rock Canyon day trips, and luxury experiences.",
    neighborhoods: ["The Strip", "Downtown Las Vegas", "Summerlin", "Henderson", "Spring Valley", "Paradise"],
  },
  {
    city: "Oklahoma City",
    state: "Oklahoma",
    stateCode: "OK",
    slugPart: "oklahoma-city",
    insight: "Oklahoma City's growing economy, major events, and central location make it an emerging Tesla rental market. Lower competition and affordable vehicle costs create strong margins for hosts.",
    neighborhoods: ["Bricktown", "Midtown", "Paseo Arts District", "Nichols Hills", "Edmond", "Norman"],
  },
  {
    city: "San Diego",
    state: "California",
    stateCode: "CA",
    slugPart: "san-diego",
    insight: "San Diego's beach culture, military presence, and steady tourism create reliable Tesla rental demand year-round. Comic-Con and cruise port traffic add seasonal spikes.",
    neighborhoods: ["Gaslamp Quarter", "La Jolla", "Pacific Beach", "North Park", "Hillcrest", "Coronado"],
  },
  {
    city: "Chicago",
    state: "Illinois",
    stateCode: "IL",
    slugPart: "chicago",
    insight: "Chicago's convention scene, Magnificent Mile shopping, and strong corporate travel make it a prime Tesla rental market. Summer festivals and sports events drive peak season demand.",
    neighborhoods: ["Loop", "River North", "Lincoln Park", "Wicker Park", "Gold Coast", "Lakeview"],
  },
  {
    city: "Seattle",
    state: "Washington",
    stateCode: "WA",
    slugPart: "seattle",
    insight: "Seattle's tech workforce, eco-friendly culture, and proximity to outdoor destinations like Mt. Rainier make Tesla the natural rental choice. No state income tax boosts host earnings.",
    neighborhoods: ["Capitol Hill", "Ballard", "Fremont", "Queen Anne", "Bellevue", "Redmond"],
  },
  {
    city: "Denver",
    state: "Colorado",
    stateCode: "CO",
    slugPart: "denver",
    insight: "Denver's booming tourism, ski season traffic, and outdoor adventure culture drive strong Tesla rental demand. Weekend trips to the Rockies keep utilization rates high year-round.",
    neighborhoods: ["LoDo", "RiNo", "Cherry Creek", "Capitol Hill", "Highlands", "Boulder"],
  },
  {
    city: "Phoenix",
    state: "Arizona",
    stateCode: "AZ",
    slugPart: "phoenix",
    insight: "Phoenix's massive snowbird population, spring training baseball, and year-round sunshine create consistent Tesla rental demand. The Scottsdale luxury market commands premium daily rates.",
    neighborhoods: ["Scottsdale", "Tempe", "Old Town", "Arcadia", "Downtown Phoenix", "Chandler"],
  },
  {
    city: "Atlanta",
    state: "Georgia",
    stateCode: "GA",
    slugPart: "atlanta",
    insight: "Atlanta's position as a major business hub, film production capital, and convention destination drives steady Tesla rental demand. Hartsfield-Jackson is the world's busiest airport.",
    neighborhoods: ["Midtown", "Buckhead", "Virginia-Highland", "Decatur", "Sandy Springs", "Alpharetta"],
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
