import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-san-francisco",
  city: "San Francisco",
  state: "California",
  stateCode: "CA",
  headline: "Tesla Car Sharing in San Francisco",
  subheadline: "The Bay Area's tech-savvy visitors and eco-conscious culture make San Francisco a top market for Tesla rentals.",
  metaTitle: "Tesla Car Sharing San Francisco | Earn Passive Income | Teslys",
  metaDescription: "Earn passive income sharing your Tesla in San Francisco. Teslys handles rentals, cleaning, and guest support in the Bay Area. Sign up today.",
  marketStats: { avgMonthlyEarnings: "$1,500+", activeHosts: "12+", avgDailyRate: "$115" },
  localContent: {
    whyCity: "San Francisco has the highest EV adoption rate in the country. Tech conferences, tourism to wine country, and corporate travel create consistent demand for Tesla rentals. Visitors love exploring the Bay Area in a premium electric vehicle, and SF's progressive EV infrastructure makes the experience seamless.",
    marketInsight: "Bay Area renters tend to book longer trips — weekend Napa Valley getaways, week-long business stays, and coastal road trips down Highway 1. Longer bookings mean higher utilization rates and less wear per dollar earned. Teslys hosts manage the entire process, from SFO pickup to Supercharger logistics.",
    popularModels: ["Tesla Model 3 Standard Range", "Tesla Model Y Long Range", "Tesla Model S", "Tesla Model 3 Performance"],
    neighborhoods: ["SoMa", "Mission District", "Pacific Heights", "Marina District", "Financial District", "Palo Alto"],
  },
};

export default function SanFranciscoPage() {
  return <CityLandingPage city={data} />;
}
