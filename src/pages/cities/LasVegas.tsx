import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-las-vegas",
  city: "Las Vegas",
  state: "Nevada",
  stateCode: "NV",
  headline: "Tesla Car Sharing in Las Vegas",
  subheadline: "Turn your Tesla into a Vegas money machine. Teslys handles rentals, cleaning, and guest support while you earn passive income from the entertainment capital of the world.",
  metaTitle: "Tesla Car Sharing Las Vegas | Earn Passive Income | Teslys",
  metaDescription: "Earn passive income sharing your Tesla in Las Vegas, NV. Teslys handles rentals, cleaning, and guest support. Start earning today.",
  marketStats: { avgMonthlyEarnings: "$1,800+", activeHosts: "4+", avgDailyRate: "$130" },
  localContent: {
    whyCity: "Las Vegas welcomes over 40 million visitors per year, creating massive and consistent demand for rental vehicles. Tesla's premium appeal and quiet luxury make it the perfect match for visitors looking for an elevated Vegas experience — from Strip cruising to day trips to Red Rock Canyon and the Hoover Dam.",
    marketInsight: "Nevada has no state income tax, so your rental earnings go further. The constant flow of tourists, conventions at the Las Vegas Convention Center, and events like CES and EDC create year-round booking opportunities that outperform most U.S. markets.",
    popularModels: ["Tesla Model Y Long Range", "Tesla Cybertruck", "Tesla Model 3 Standard Range", "Tesla Model X"],
    neighborhoods: ["The Strip", "Downtown Las Vegas", "Summerlin", "Henderson", "Spring Valley", "Paradise"],
  },
};

export default function LasVegasPage() {
  return <CityLandingPage city={data} />;
}
