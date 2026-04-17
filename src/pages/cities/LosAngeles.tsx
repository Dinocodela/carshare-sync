import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-los-angeles",
  city: "Los Angeles",
  state: "California",
  stateCode: "CA",
  headline: "Tesla Car Sharing in Los Angeles",
  subheadline: "Turn your Tesla into passive income in the nation's largest car-sharing market. LA's year-round sunshine and tourism make it the perfect city for Tesla rentals.",
  metaTitle: "Tesla Car Sharing Los Angeles | Earn Passive Income | Teslys",
  metaDescription: "Earn passive income by sharing your Tesla in Los Angeles. Teslys handles rentals, cleaning, and guest support. Join LA's top Tesla car sharing platform.",
  marketStats: { avgMonthlyEarnings: "$1,800+", activeHosts: "25+", avgDailyRate: "$120" },
  localContent: {
    whyCity: "Los Angeles is the epicenter of the car-sharing revolution. With over 50 million tourists annually, a car-dependent culture, and a strong appetite for electric vehicles, LA Tesla owners consistently see the highest rental demand in the country. Airport proximity, beach destinations, and a sprawling metro area create non-stop booking opportunities.",
    marketInsight: "Tesla Model 3 and Model Y are among the most requested vehicles on Turo in the greater LA area. With Teslys managing your car, you can capture peak-season rates during summer and awards season while avoiding the hassle of guest coordination, cleaning, and vehicle logistics.",
    popularModels: ["Tesla Model 3 Long Range", "Tesla Model Y Performance", "Tesla Model S Plaid", "Tesla Model X"],
    neighborhoods: ["Santa Monica", "Hollywood", "Downtown LA", "Marina Del Rey", "Venice", "Beverly Hills"],
  },
};

export default function LosAngelesPage() {
  return <CityLandingPage city={data} />;
}
