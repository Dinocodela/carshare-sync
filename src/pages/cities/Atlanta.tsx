import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-atlanta",
  city: "Atlanta",
  state: "Georgia",
  stateCode: "GA",
  headline: "Tesla Car Sharing in Atlanta",
  subheadline: "The capital of the South and a major business hub, Atlanta offers strong and consistent demand for Tesla rentals.",
  metaTitle: "Tesla Car Sharing Atlanta | Earn Passive Income | Teslys",
  metaDescription: "Earn passive income sharing your Tesla in Atlanta, GA. Teslys handles rentals, cleaning, and guest support. Join Atlanta's growing Tesla rental market.",
  marketStats: { avgMonthlyEarnings: "$1,350+", activeHosts: "5+", avgDailyRate: "$108" },
  localContent: {
    whyCity: "Atlanta is home to the world's busiest airport (Hartsfield-Jackson) and a thriving film industry, corporate headquarters, and convention scene. The city's mix of business and leisure travelers creates consistent rental demand throughout the year.",
    marketInsight: "Hartsfield-Jackson processes over 90 million passengers annually — many of whom need premium ground transportation. Atlanta's film industry ('Hollywood of the South'), major sporting events, and corporate travel from Fortune 500 headquarters drive steady bookings.",
    popularModels: ["Tesla Model Y Long Range", "Tesla Model 3 Standard Range", "Tesla Model 3 Performance", "Tesla Model X"],
    neighborhoods: ["Buckhead", "Midtown", "Decatur", "Sandy Springs", "Marietta", "Alpharetta"],
  },
};

export default function AtlantaPage() {
  return <CityLandingPage city={data} />;
}
