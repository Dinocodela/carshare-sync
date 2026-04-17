import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-miami",
  city: "Miami",
  state: "Florida",
  stateCode: "FL",
  headline: "Tesla Car Sharing in Miami",
  subheadline: "Miami's luxury tourism scene and year-round warm weather make it one of the most profitable cities for Tesla car sharing in the U.S.",
  metaTitle: "Tesla Car Sharing Miami | Earn Passive Income | Teslys",
  metaDescription: "Share your Tesla in Miami and earn passive income. Teslys manages rentals, cleaning, and guest support. Join Miami's leading Tesla car sharing platform.",
  marketStats: { avgMonthlyEarnings: "$1,600+", activeHosts: "15+", avgDailyRate: "$130" },
  localContent: {
    whyCity: "Miami attracts high-spending tourists, business travelers, and international visitors year-round. The city's luxury lifestyle culture means guests actively seek premium electric vehicles like Teslas. Art Basel, Ultra Music Festival, and the Miami Grand Prix create seasonal demand spikes that smart owners capitalize on.",
    marketInsight: "Florida's lack of state income tax means more of your rental income stays in your pocket. Combined with Miami's high daily rates and consistent demand, Tesla owners in South Florida regularly outperform national averages. Teslys hosts in Miami handle everything from airport handoffs to South Beach deliveries.",
    popularModels: ["Tesla Model 3 Performance", "Tesla Model Y Long Range", "Tesla Model S", "Tesla Model X Plaid"],
    neighborhoods: ["South Beach", "Brickell", "Wynwood", "Coconut Grove", "Coral Gables", "Miami Beach"],
  },
};

export default function MiamiPage() {
  return <CityLandingPage city={data} />;
}
