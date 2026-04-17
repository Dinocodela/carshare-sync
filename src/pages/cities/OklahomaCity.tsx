import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-oklahoma-city",
  city: "Oklahoma City",
  state: "Oklahoma",
  stateCode: "OK",
  headline: "Tesla Car Sharing in Oklahoma City",
  subheadline: "Tap into OKC's growing rental market. Let Teslys manage your Tesla while you earn passive income in one of America's fastest-growing cities.",
  metaTitle: "Tesla Car Sharing Oklahoma City | Earn Passive Income | Teslys",
  metaDescription: "Earn passive income sharing your Tesla in Oklahoma City, OK. Teslys handles rentals, cleaning, and guest support. Start earning today.",
  marketStats: { avgMonthlyEarnings: "$1,100+", activeHosts: "2+", avgDailyRate: "$85" },
  localContent: {
    whyCity: "Oklahoma City is booming — with a growing tech sector, energy industry, and a vibrant downtown revitalization. Lower competition in the Tesla rental space means early movers can capture significant market share and build a loyal renter base.",
    marketInsight: "OKC benefits from steady business travel, Thunder NBA games, and a central location that draws road trippers. Lower cost of living means your vehicle costs are lower, and strong weekend demand from events at Paycom Center and the Oklahoma State Fair keeps bookings consistent.",
    popularModels: ["Tesla Model 3 Standard Range", "Tesla Model Y Long Range", "Tesla Cybertruck"],
    neighborhoods: ["Bricktown", "Midtown", "Paseo Arts District", "Nichols Hills", "Edmond", "Norman"],
  },
};

export default function OklahomaCityPage() {
  return <CityLandingPage city={data} />;
}
