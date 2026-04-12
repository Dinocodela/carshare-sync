import { ModelDetailPage, ModelDetailData } from "@/components/marketing/ModelDetailPage";

const data: ModelDetailData = {
  slug: "tesla-model-x-rental",
  model: "Tesla Model X",
  modelShort: "Model X",
  metaTitle: "Tesla Model X Rental Income | Earn $2,000+/mo | Teslys",
  metaDescription: "How much can you earn renting your Tesla Model X? See real earnings data, daily rates, and get started with Teslys co-hosting today.",
  headline: "Rent Out Your Tesla Model X",
  subheadline: "The Model X is a luxury SUV with falcon-wing doors that attracts families and premium travelers willing to pay top dollar.",
  avgMonthlyEarnings: "$2,000+",
  avgDailyRate: "$155+",
  overview: "The Tesla Model X stands out in the rental market as a premium family SUV with iconic falcon-wing doors, seating for up to 7, and impressive range. It attracts families, business travelers, and luxury seekers — all willing to pay significantly more than sedan alternatives.",
  whyRent: "The Model X occupies a unique position: it's the only electric luxury SUV with third-row seating and distinctive falcon-wing doors. This combination of practicality and wow-factor keeps it booked consistently at premium rates that justify the higher purchase price.",
  specs: [
    { label: "Range", value: "348 mi" },
    { label: "0-60 mph", value: "2.5s" },
    { label: "Seating", value: "Up to 7" },
    { label: "Cargo", value: "91 cu ft" },
  ],
  comparisonModels: [
    { model: "Tesla Model X", dailyRate: "$155+", monthlyEarnings: "$2,000+", bestFor: "Luxury SUV families" },
    { model: "Tesla Cybertruck", dailyRate: "$185+", monthlyEarnings: "$2,500+", bestFor: "Maximum earnings & novelty" },
    { model: "Tesla Model S", dailyRate: "$140+", monthlyEarnings: "$1,900+", bestFor: "Premium sedan market" },
    { model: "Tesla Model Y", dailyRate: "$110+", monthlyEarnings: "$1,600+", bestFor: "High-volume SUV bookings" },
    { model: "Tesla Model 3", dailyRate: "$90+", monthlyEarnings: "$1,300+", bestFor: "Budget-conscious renters" },
  ],
  faqs: [
    { question: "How much can I earn renting my Model X?", answer: "Model X owners on Teslys earn an average of $2,000+ per month, with daily rates ranging from $140 to $175+ depending on location and season." },
    { question: "Is the Model X good for rentals?", answer: "Yes — the Model X is one of the highest-earning Teslas on rental platforms. Its family-friendly seating, luxury features, and falcon-wing doors make it highly desirable." },
    { question: "What about wear and tear on my Model X?", answer: "Teslys conducts thorough vehicle inspections before and after every trip. Our professional co-hosting team ensures your Model X is cleaned and maintained to the highest standards." },
    { question: "Can I still use my Model X when it's listed?", answer: "Absolutely. You control your availability calendar and can block off dates whenever you need your vehicle." },
  ],
  topCities: [
    { city: "Los Angeles", slug: "tesla-model-x-rental-income-los-angeles" },
    { city: "Miami", slug: "tesla-model-x-rental-income-miami" },
    { city: "San Francisco", slug: "tesla-model-x-rental-income-san-francisco" },
    { city: "New York", slug: "tesla-model-x-rental-income-new-york" },
    { city: "Austin", slug: "tesla-model-x-rental-income-austin" },
    { city: "Dallas", slug: "tesla-model-x-rental-income-dallas" },
    { city: "Las Vegas", slug: "tesla-model-x-rental-income-las-vegas" },
    { city: "Oklahoma City", slug: "tesla-model-x-rental-income-oklahoma-city" },
  ],
};

export default function ModelXRentalPage() {
  return <ModelDetailPage data={data} />;
}
