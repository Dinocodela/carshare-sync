import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-denver",
  city: "Denver",
  state: "Colorado",
  stateCode: "CO",
  headline: "Tesla Car Sharing in Denver",
  subheadline: "Colorado's outdoor lifestyle and growing tech scene drive strong demand for Tesla rentals year-round.",
  metaTitle: "Tesla Car Sharing Denver | Earn Passive Income | Teslys",
  metaDescription: "Earn passive income sharing your Tesla in Denver, CO. Teslys handles rentals, cleaning, and guest support. Tap into Colorado's booming rental market.",
  marketStats: { avgMonthlyEarnings: "$1,300+", activeHosts: "4+", avgDailyRate: "$105" },
  localContent: {
    whyCity: "Denver is a top destination for outdoor enthusiasts heading to the Rocky Mountains. Ski season, summer hiking, and Red Rocks events create year-round rental demand. Colorado's EV incentives and extensive Supercharger network make Tesla the vehicle of choice.",
    marketInsight: "Denver International Airport is one of the busiest in the country, bringing millions of visitors annually. Ski season (November-April) and summer tourism create two distinct high-demand periods, while conventions and business travel fill the gaps.",
    popularModels: ["Tesla Model Y Long Range", "Tesla Model 3 Standard Range", "Tesla Model X", "Tesla Cybertruck"],
    neighborhoods: ["LoDo", "RiNo", "Cherry Creek", "Boulder", "Golden", "Aurora"],
  },
};

export default function DenverPage() {
  return <CityLandingPage city={data} />;
}
