import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-seattle",
  city: "Seattle",
  state: "Washington",
  stateCode: "WA",
  headline: "Tesla Car Sharing in Seattle",
  subheadline: "Seattle's tech-forward culture and EV infrastructure make it a perfect market for Tesla car sharing.",
  metaTitle: "Tesla Car Sharing Seattle | Earn Passive Income | Teslys",
  metaDescription: "Earn passive income sharing your Tesla in Seattle, WA. Teslys handles rentals, cleaning, and guest support. Start earning in the Pacific Northwest.",
  marketStats: { avgMonthlyEarnings: "$1,350+", activeHosts: "4+", avgDailyRate: "$108" },
  localContent: {
    whyCity: "Seattle is one of the most EV-friendly cities in the U.S., with extensive charging infrastructure and a tech-savvy population. Amazon, Microsoft, and Boeing bring a constant flow of business travelers who prefer premium electric vehicles.",
    marketInsight: "Washington has no state income tax, maximizing your rental earnings. Summer tourism to Mount Rainier, the San Juan Islands, and Olympic Peninsula drives strong seasonal demand, while tech business travel keeps bookings steady year-round.",
    popularModels: ["Tesla Model Y Long Range", "Tesla Model 3 Standard Range", "Tesla Model X", "Tesla Model 3 Performance"],
    neighborhoods: ["Capitol Hill", "Ballard", "Fremont", "Bellevue", "Redmond", "Kirkland"],
  },
};

export default function SeattlePage() {
  return <CityLandingPage city={data} />;
}
