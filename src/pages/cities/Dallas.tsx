import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-dallas",
  city: "Dallas",
  state: "Texas",
  stateCode: "TX",
  headline: "Tesla Car Sharing in Dallas",
  subheadline: "Tap into the booming DFW metroplex rental market. Let Teslys manage your Tesla while you earn passive income.",
  metaTitle: "Tesla Car Sharing Dallas | Earn Passive Income | Teslys",
  metaDescription: "Earn passive income sharing your Tesla in Dallas, TX. Teslys handles rentals, cleaning, and guest support. Start earning today.",
  marketStats: { avgMonthlyEarnings: "$1,400+", activeHosts: "6+", avgDailyRate: "$110" },
  localContent: {
    whyCity: "Dallas-Fort Worth is the fourth-largest metro in the U.S. with a thriving business travel scene, major sports events, and year-round conventions. Tesla demand is consistently high from corporate travelers and weekend tourists exploring the metroplex.",
    marketInsight: "Texas has no state income tax, so your rental earnings go further. DFW International Airport drives strong weekday demand from business travelers, while weekend events at AT&T Stadium and the Dallas Cowboys keep bookings steady year-round.",
    popularModels: ["Tesla Model Y Long Range", "Tesla Model 3 Standard Range", "Tesla Model X", "Tesla Cybertruck"],
    neighborhoods: ["Uptown Dallas", "Deep Ellum", "Frisco", "Plano", "Arlington", "Fort Worth"],
  },
};

export default function DallasPage() {
  return <CityLandingPage city={data} />;
}
