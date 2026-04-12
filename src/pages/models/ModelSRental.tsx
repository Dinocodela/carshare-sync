import { ModelDetailPage, ModelDetailData } from "@/components/marketing/ModelDetailPage";

const data: ModelDetailData = {
  slug: "tesla-model-s-rental",
  model: "Tesla Model S",
  modelShort: "Model S",
  metaTitle: "Tesla Model S Rental Income | Earn $1,900+/mo | Teslys",
  metaDescription: "How much can you earn renting your Tesla Model S? See real earnings data, daily rates, and get started with Teslys co-hosting today.",
  headline: "Rent Out Your Tesla Model S",
  subheadline: "Tesla's flagship performance sedan commands premium daily rates from business executives and car enthusiasts.",
  avgMonthlyEarnings: "$1,900+",
  avgDailyRate: "$140+",
  overview: "The Tesla Model S is the ultimate performance sedan — with Plaid delivering sub-2-second 0-60 times, it's a dream rental for car enthusiasts and a premium choice for business travelers. Its long range and luxurious interior make it ideal for airport pickups and multi-day trips.",
  whyRent: "The Model S attracts a premium renter demographic — business executives, car enthusiasts, and travelers who want the best. This means higher daily rates, better care of your vehicle, and consistent demand from a segment that books further in advance and tips well.",
  specs: [
    { label: "Range", value: "405 mi" },
    { label: "0-60 mph", value: "1.99s" },
    { label: "Horsepower", value: "1,020 hp" },
    { label: "Cargo", value: "28 cu ft" },
  ],
  comparisonModels: [
    { model: "Tesla Model S", dailyRate: "$140+", monthlyEarnings: "$1,900+", bestFor: "Premium sedan market" },
    { model: "Tesla Cybertruck", dailyRate: "$185+", monthlyEarnings: "$2,500+", bestFor: "Maximum earnings & novelty" },
    { model: "Tesla Model X", dailyRate: "$155+", monthlyEarnings: "$2,000+", bestFor: "Luxury SUV families" },
    { model: "Tesla Model Y", dailyRate: "$110+", monthlyEarnings: "$1,600+", bestFor: "High-volume SUV bookings" },
    { model: "Tesla Model 3", dailyRate: "$90+", monthlyEarnings: "$1,300+", bestFor: "Budget-conscious renters" },
  ],
  faqs: [
    { question: "How much can I earn renting my Model S?", answer: "Model S owners on Teslys earn an average of $1,900+ per month, with daily rates ranging from $125 to $160+ depending on trim (Long Range vs Plaid) and location." },
    { question: "Is the Model S Plaid worth more for rentals?", answer: "Yes — the Plaid variant commands a significant premium, often $20-30 more per day. Its performance specs are a major draw for car enthusiasts and content creators." },
    { question: "How does Teslys protect my Model S?", answer: "Every trip is covered by commercial insurance. We conduct pre- and post-trip inspections, and our professional co-hosts ensure your Model S is maintained to the highest standards." },
    { question: "What's the ideal renter for a Model S?", answer: "The Model S attracts business executives, car enthusiasts, and special occasion renters. These guests tend to book longer trips and treat the vehicle with more care." },
  ],
  topCities: [
    { city: "Los Angeles", slug: "tesla-model-s-rental-income-los-angeles" },
    { city: "Miami", slug: "tesla-model-s-rental-income-miami" },
    { city: "San Francisco", slug: "tesla-model-s-rental-income-san-francisco" },
    { city: "New York", slug: "tesla-model-s-rental-income-new-york" },
    { city: "Austin", slug: "tesla-model-s-rental-income-austin" },
    { city: "Dallas", slug: "tesla-model-s-rental-income-dallas" },
    { city: "Las Vegas", slug: "tesla-model-s-rental-income-las-vegas" },
    { city: "Oklahoma City", slug: "tesla-model-s-rental-income-oklahoma-city" },
  ],
};

export default function ModelSRentalPage() {
  return <ModelDetailPage data={data} />;
}
