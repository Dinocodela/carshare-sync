import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "How much can I earn renting my Tesla through Teslys?",
      answer:
        "Tesla owners typically earn between $1,500 to $3,000+ per month depending on your location, vehicle model, and rental frequency. Model 3 and Model Y vehicles are in high demand and can generate substantial passive income. We handle all the management, so you earn without the hassle of coordinating rentals, cleaning, or guest communication.",
    },
    {
      question: "Is Tesla car sharing profitable?",
      answer:
        "Yes! Many Tesla owners cover their monthly car payments entirely through Teslys rentals, with surplus income becoming true passive earnings. After accounting for our management fees, cleaning, and minimal wear, most hosts see significant net profit. Our analytics dashboard helps you track every dollar earned and spent, making it easy to optimize your earnings.",
    },
    {
      question: "How does Teslys protect my Tesla during rentals?",
      answer:
        "We implement multiple layers of protection: thorough guest screening and verification, comprehensive insurance coverage for every rental, 24/7 monitoring and support, GPS tracking and remote control through Tesla's app, and professional cleaning and inspection after each rental. Your vehicle's safety is our top priority.",
    },
    {
      question: "What does Teslys handle for me?",
      answer:
        "Teslys provides full-service rental management including guest screening and booking coordination, professional cleaning between rentals, 24/7 guest support and communication, maintenance scheduling and tracking, earnings and expense analytics, and emergency assistance. You simply provide the vehicle and collect passive income.",
    },
    {
      question: "Do I need to be present for rentals?",
      answer:
        "No! That's the beauty of Tesla's keyless entry system and our management platform. We coordinate all pickups and drop-offs, handle key access remotely, and manage guest communications. You can earn passive income whether you're at work, on vacation, or sleeping. Many hosts never meet their guests.",
    },
    {
      question: "What happens if my Tesla gets damaged?",
      answer:
        "Every rental includes comprehensive insurance coverage. If damage occurs, we handle the entire claims process from documentation and filing to repairs and communication with guests. Our platform tracks all incidents, and you're protected from financial loss. Most hosts never experience issues thanks to our thorough guest screening.",
    },
    {
      question: "Can I block dates when I need my Tesla?",
      answer:
        "Absolutely! Our calendar system lets you block dates anytime you need your vehicle for personal use. Whether it's a weekend trip, daily commute needs, or extended vacation, you maintain full control over your Tesla's availability. Simply mark your calendar, and we won't accept bookings during those times.",
    },
    {
      question: "How do I get started with Tesla car sharing?",
      answer:
        "Getting started is simple: Download the Teslys app from the App Store or Google Play, create your host account and verify your Tesla ownership, set your availability and preferences, and we'll handle the rest! Our onboarding team helps you through every step, and you can start earning passive income within days.",
    },
    {
      question: "What Tesla models work with Teslys?",
      answer:
        "We support all Tesla models including Model 3, Model Y, Model S, and Model X. Model 3 and Model Y are especially popular with guests due to their balance of affordability and features. Both Long Range and Performance variants are welcome on our platform.",
    },
    {
      question: "How often will my Tesla be rented?",
      answer:
        "Rental frequency depends on your location, pricing, and availability settings. Urban areas typically see higher demand with rentals possible 15-25 days per month. Our analytics show you optimal pricing strategies to maximize both occupancy and revenue. You control the minimum rental periods and pricing.",
    },
    {
      question: "Does Teslys handle cleaning between rentals?",
      answer:
        "Yes! We coordinate professional cleaning after every rental. Our cleaning partners are Tesla-familiar and ensure your vehicle is pristine for the next guest. Cleaning costs are transparently tracked in your expense dashboard, and we schedule cleanings efficiently to minimize downtime between rentals.",
    },
    {
      question: "What are the fees for using Teslys?",
      answer:
        "Teslys charges a service fee that covers our full-service management including guest screening, 24/7 support, cleaning coordination, maintenance tracking, and platform technology. All fees are transparent and deducted before payouts. Most hosts find the passive income far exceeds the management costs, especially compared to self-managing rentals.",
    },
    {
      question: "How do I track my Tesla rental earnings?",
      answer:
        "Our comprehensive analytics dashboard provides real-time tracking of gross earnings, cleaning and maintenance expenses, net profit by day/week/month, rental frequency and duration, and per-mile earnings. You can export reports for tax purposes and view detailed breakdowns by vehicle if you have multiple Teslas enrolled.",
    },
    {
      question: "Can I rent out multiple Teslas?",
      answer:
        "Yes! Many successful hosts scale to 2, 3, or more Tesla vehicles to multiply their passive income. Our platform easily manages multiple vehicles with separate calendars, analytics, and expense tracking for each car. Some hosts build substantial businesses renting fleets of Teslas through Teslys.",
    },
    {
      question: "What insurance is required for Tesla car sharing?",
      answer:
        "Teslys partnerships provide comprehensive commercial rental insurance that covers every booking. This is separate from your personal auto insurance and includes liability coverage, collision and comprehensive coverage, and guest protection. All insurance requirements are handled automatically when you list your Tesla.",
    },
  ];

  const faqSchema = faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  }));

  return (
    <>
      <SEO
        title="Tesla Car Sharing FAQ - Teslys Passive Income Questions Answered"
        description="Common questions about Tesla car sharing, passive income, and rental management answered. Learn how much you can earn, how we protect your Tesla, and how to get started with Teslys."
        keywords="Tesla car sharing FAQ, Tesla passive income questions, Tesla rental management help, how much earn renting Tesla, Tesla sharing platform questions"
        canonical="https://teslys.app/faq"
        ogType="website"
      />
      <StructuredData type="faq" data={{ questions: faqSchema }} />
      
      <DashboardLayout>
        <ScreenHeader title="Frequently Asked Questions" fallbackHref="/" />
        
        <PageContainer className="py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-4 text-foreground">
                Tesla Car Sharing FAQ
              </h1>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about earning passive income with your Tesla
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border rounded-lg px-6 bg-card"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-semibold text-foreground pr-4">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 p-8 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-3 text-foreground">
                Still have questions?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our support team is here to help you succeed with Tesla car sharing
              </p>
              <a
                href="/support"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </PageContainer>
      </DashboardLayout>
    </>
  );
}
