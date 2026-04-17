import { ModelDetailPage, ModelDetailData } from "@/components/marketing/ModelDetailPage";

const data: ModelDetailData = {
  slug: "tesla-cybertruck-rental",
  model: "Tesla Cybertruck",
  modelShort: "Cybertruck",
  metaTitle: "Tesla Cybertruck Rental Income | Earn $2,500+/mo | Teslys",
  metaDescription: "How much can you earn renting your Tesla Cybertruck? See real earnings data, daily rates, and get started with Teslys co-hosting today.",
  headline: "Rent Out Your Tesla Cybertruck",
  subheadline: "The Cybertruck is the highest-earning Tesla on rental platforms. Its futuristic design and limited availability drive massive demand and premium pricing.",
  avgMonthlyEarnings: "$2,500+",
  avgDailyRate: "$185+",
  overview: "The Tesla Cybertruck is the most in-demand rental vehicle on platforms like Turo. Its unique design, novelty factor, and limited supply mean renters are willing to pay premium rates just to experience it. As a Cybertruck owner, you can turn this demand into significant passive income with Teslys managing every aspect of the rental process.",
  whyRent: "Cybertruck listings consistently outperform every other Tesla model in daily rate and booking frequency. The novelty factor drives both weekend joy-riders and content creators who want to film with the truck, creating demand that far exceeds supply in every major market.",
  specs: [
    { label: "Range", value: "340+ mi" },
    { label: "0-60 mph", value: "2.6s" },
    { label: "Towing", value: "11,000 lbs" },
    { label: "Bed Length", value: "6 ft" },
  ],
  comparisonModels: [
    { model: "Tesla Cybertruck", dailyRate: "$185+", monthlyEarnings: "$2,500+", bestFor: "Maximum earnings & novelty" },
    { model: "Tesla Model X", dailyRate: "$155+", monthlyEarnings: "$2,100+", bestFor: "Luxury SUV families" },
    { model: "Tesla Model S", dailyRate: "$140+", monthlyEarnings: "$1,900+", bestFor: "Premium sedan market" },
    { model: "Tesla Model Y", dailyRate: "$110+", monthlyEarnings: "$1,600+", bestFor: "High-volume SUV bookings" },
    { model: "Tesla Model 3", dailyRate: "$90+", monthlyEarnings: "$1,300+", bestFor: "Budget-conscious renters" },
  ],
  faqs: [
    { question: "How much can I earn renting my Cybertruck?", answer: "Cybertruck owners on Teslys earn an average of $2,500+ per month, with daily rates ranging from $175 to $220+ depending on your city and season." },
    { question: "Is there enough demand for Cybertruck rentals?", answer: "Absolutely. The Cybertruck is the most searched-for rental vehicle on Turo, and demand consistently outstrips supply. Most Cybertruck listings are booked 20+ days per month." },
    { question: "Does Teslys handle everything?", answer: "Yes — Teslys manages guest communication, vehicle cleaning, key handoff, and insurance coordination. You simply provide the Cybertruck and earn passive income." },
    { question: "Is my Cybertruck insured during rentals?", answer: "Yes. Every trip is covered by commercial rental insurance, protecting you against damage, theft, and liability." },
  ],
  topCities: [
    { city: "Los Angeles", slug: "tesla-cybertruck-rental-income-los-angeles" },
    { city: "Miami", slug: "tesla-cybertruck-rental-income-miami" },
    { city: "Las Vegas", slug: "tesla-cybertruck-rental-income-las-vegas" },
    { city: "Austin", slug: "tesla-cybertruck-rental-income-austin" },
    { city: "Dallas", slug: "tesla-cybertruck-rental-income-dallas" },
    { city: "New York", slug: "tesla-cybertruck-rental-income-new-york" },
    { city: "San Francisco", slug: "tesla-cybertruck-rental-income-san-francisco" },
    { city: "Oklahoma City", slug: "tesla-cybertruck-rental-income-oklahoma-city" },
  ],
};

export default function CybertruckRentalPage() {
  return <ModelDetailPage data={data} />;
}
