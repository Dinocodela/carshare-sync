import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-new-york",
  city: "New York",
  state: "New York",
  stateCode: "NY",
  headline: "Tesla Car Sharing in New York",
  subheadline: "NYC's massive tourism industry and weekend getaway culture create strong demand for Tesla rentals in the tri-state area.",
  metaTitle: "Tesla Car Sharing New York | Earn Passive Income | Teslys",
  metaDescription: "Share your Tesla in New York and earn passive income. Teslys handles rentals, cleaning, and guest support. Join NYC's growing Tesla car sharing market.",
  marketStats: { avgMonthlyEarnings: "$1,400+", activeHosts: "10+", avgDailyRate: "$125" },
  localContent: {
    whyCity: "New York City attracts over 60 million visitors annually. While many tourists use transit in Manhattan, weekend trips to the Hamptons, Hudson Valley, and Connecticut create strong demand for premium vehicle rentals. Tesla's brand recognition and zero-emissions appeal resonate strongly with NY's environmentally conscious renters.",
    marketInsight: "The tri-state area offers unique advantages: high daily rates, weekend demand spikes, and a growing network of Superchargers throughout the Northeast. Many NYC-based Tesla owners don't drive daily, making car sharing a perfect way to offset ownership costs. Teslys hosts handle everything from parking logistics to guest vetting.",
    popularModels: ["Tesla Model 3 Long Range", "Tesla Model Y Performance", "Tesla Model S Long Range", "Tesla Model X"],
    neighborhoods: ["Manhattan", "Brooklyn", "Queens", "Jersey City", "Hoboken", "Westchester"],
  },
};

export default function NewYorkPage() {
  return <CityLandingPage city={data} />;
}
