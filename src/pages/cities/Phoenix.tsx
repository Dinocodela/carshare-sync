import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-phoenix",
  city: "Phoenix",
  state: "Arizona",
  stateCode: "AZ",
  headline: "Tesla Car Sharing in Phoenix",
  subheadline: "Arizona's winter tourism boom and year-round sunshine make Phoenix a top market for Tesla car sharing.",
  metaTitle: "Tesla Car Sharing Phoenix | Earn Passive Income | Teslys",
  metaDescription: "Earn passive income sharing your Tesla in Phoenix, AZ. Teslys handles rentals, cleaning, and guest support. Capitalize on Arizona's booming rental market.",
  marketStats: { avgMonthlyEarnings: "$1,250+", activeHosts: "5+", avgDailyRate: "$100" },
  localContent: {
    whyCity: "Phoenix is one of the fastest-growing cities in the U.S. with a massive winter tourism influx — snowbirds and spring training fans drive peak-season demand from October through April. The city's sprawling layout makes a car essential, and Teslas are the premium choice.",
    marketInsight: "Arizona has no vehicle emissions testing requirements for EVs and offers HOV lane access for electric vehicles. Spring training, the Waste Management Open, and Super Bowl events create major demand spikes. Year-round sunshine means no weather-related booking drops.",
    popularModels: ["Tesla Model Y Long Range", "Tesla Model 3 Standard Range", "Tesla Cybertruck", "Tesla Model X"],
    neighborhoods: ["Scottsdale", "Tempe", "Chandler", "Mesa", "Old Town Scottsdale", "Paradise Valley"],
  },
};

export default function PhoenixPage() {
  return <CityLandingPage city={data} />;
}
