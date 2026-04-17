import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-chicago",
  city: "Chicago",
  state: "Illinois",
  stateCode: "IL",
  headline: "Tesla Car Sharing in Chicago",
  subheadline: "The Windy City's massive tourism and business travel market creates year-round demand for Tesla rentals.",
  metaTitle: "Tesla Car Sharing Chicago | Earn Passive Income | Teslys",
  metaDescription: "Earn passive income sharing your Tesla in Chicago, IL. Teslys handles rentals, cleaning, and guest support. Join Chicago's growing Tesla rental community.",
  marketStats: { avgMonthlyEarnings: "$1,500+", activeHosts: "5+", avgDailyRate: "$115" },
  localContent: {
    whyCity: "Chicago attracts over 60 million visitors annually. From Lollapalooza to business conventions at McCormick Place, the city generates consistent rental demand. Tesla's premium appeal resonates with Chicago's affluent traveler base.",
    marketInsight: "Summer months see peak demand with festivals, outdoor events, and road trips to Wisconsin and Michigan. O'Hare and Midway airports bring a steady stream of travelers looking for premium rental experiences beyond traditional car rental agencies.",
    popularModels: ["Tesla Model Y Long Range", "Tesla Model 3 Performance", "Tesla Model X", "Tesla Model S"],
    neighborhoods: ["Loop", "Lincoln Park", "Wicker Park", "River North", "Gold Coast", "Evanston"],
  },
};

export default function ChicagoPage() {
  return <CityLandingPage city={data} />;
}
