import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-austin",
  city: "Austin",
  state: "Texas",
  stateCode: "TX",
  headline: "Tesla Car Sharing in Austin",
  subheadline: "Home to Tesla's Gigafactory and a booming tech scene, Austin is one of the fastest-growing markets for Tesla car sharing.",
  metaTitle: "Tesla Car Sharing Austin | Earn Passive Income | Teslys",
  metaDescription: "Earn passive income sharing your Tesla in Austin, TX. Teslys handles rentals, cleaning, and guest support. Join Austin's Tesla car sharing community.",
  marketStats: { avgMonthlyEarnings: "$1,300+", activeHosts: "8+", avgDailyRate: "$105" },
  localContent: {
    whyCity: "Austin is Tesla's home turf — Gigafactory Texas sits just outside the city. The city's rapid growth, SXSW, ACL Festival, and year-round events drive consistent rental demand. Austin's tech-forward population has one of the highest Tesla ownership rates per capita, and visitors love experiencing the brand in its hometown.",
    marketInsight: "Texas has no state income tax, maximizing your rental earnings. Austin's event calendar — from F1 at COTA to SXSW — creates predictable demand spikes where daily rates can surge 40-60%. Teslys hosts in Austin leverage these peaks while maintaining steady baseline bookings from business travelers and relocators.",
    popularModels: ["Tesla Model Y Long Range", "Tesla Model 3 Standard Range", "Tesla Cybertruck", "Tesla Model 3 Performance"],
    neighborhoods: ["Downtown Austin", "South Congress", "East Austin", "Domain", "Round Rock", "Cedar Park"],
  },
};

export default function AustinPage() {
  return <CityLandingPage city={data} />;
}
