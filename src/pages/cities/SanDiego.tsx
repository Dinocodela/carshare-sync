import { CityLandingPage, CityData } from "@/components/marketing/CityLandingPage";

const data: CityData = {
  slug: "tesla-car-sharing-san-diego",
  city: "San Diego",
  state: "California",
  stateCode: "CA",
  headline: "Tesla Car Sharing in San Diego",
  subheadline: "San Diego's perfect weather, military community, and tourism scene make it an ideal market for Tesla car sharing year-round.",
  metaTitle: "Tesla Car Sharing San Diego | Earn Passive Income | Teslys",
  metaDescription: "Share your Tesla in San Diego and earn passive income. Teslys manages everything — rentals, cleaning, guest support. Start earning today.",
  marketStats: { avgMonthlyEarnings: "$1,400+", activeHosts: "10+", avgDailyRate: "$110" },
  localContent: {
    whyCity: "San Diego enjoys 266 sunny days per year and attracts over 35 million visitors annually. The city's mix of beach tourism, Comic-Con, military relocations, and cross-border travel from Mexico creates diverse and consistent demand for premium vehicle rentals. Tesla's convertible-alternative appeal and Autopilot features are especially popular with vacationers exploring the coastline.",
    marketInsight: "San Diego's proximity to LA means overflow demand during peak seasons. The military community provides a unique market segment — service members on temporary assignments often prefer renting over buying. Teslys hosts in San Diego benefit from this reliable demand base while capturing tourist bookings during summer and holiday seasons.",
    popularModels: ["Tesla Model 3 Long Range", "Tesla Model Y Standard Range", "Tesla Model S", "Tesla Model 3 Performance"],
    neighborhoods: ["La Jolla", "Pacific Beach", "Gaslamp Quarter", "North Park", "Coronado", "Del Mar"],
  },
};

export default function SanDiegoPage() {
  return <CityLandingPage city={data} />;
}
