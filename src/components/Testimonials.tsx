import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import { StructuredData } from "./StructuredData";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  comment: string;
  avatar?: string;
  date: string;
  carModel: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Michael Chen",
    role: "Tesla Model 3 Owner",
    location: "Marina del Rey, CA",
    rating: 5,
    comment: "Teslys has completely transformed my Tesla into a revenue-generating asset. I earn $2,500+ monthly in passive income while they handle everything - cleaning, guest support, maintenance scheduling. Best decision I've made!",
    date: "2024-11-01",
    carModel: "Tesla Model 3 Long Range",
  },
  {
    id: "2",
    name: "Sarah Rodriguez",
    role: "Tesla Model Y Owner",
    location: "Beverly Hills, CA",
    rating: 5,
    comment: "As a busy professional, I don't have time to manage rentals. Teslys makes it effortless - they handle guest screening, coordinate cleanings, and I just watch the earnings roll in. My Model Y pays for itself now!",
    date: "2024-10-15",
    carModel: "Tesla Model Y Performance",
  },
  {
    id: "3",
    name: "James Patterson",
    role: "Tesla Model S Owner",
    location: "San Diego, CA",
    rating: 5,
    comment: "I was skeptical about car sharing, but Teslys's full-service approach won me over. They treat my Model S like their own, handle all maintenance scheduling, and provide detailed analytics. Earning $3,200/month consistently!",
    date: "2024-10-28",
    carModel: "Tesla Model S Plaid",
  },
  {
    id: "4",
    name: "Emily Watson",
    role: "Tesla Fleet Owner",
    location: "Los Angeles, CA",
    rating: 5,
    comment: "Managing 4 Teslas through Teslys has been seamless. Their platform gives me complete visibility into earnings, expenses, and maintenance across all vehicles. Customer support is incredibly responsive. Highly recommended!",
    date: "2024-11-05",
    carModel: "Multiple Tesla Models",
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  return (
    <div
      className="group relative rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Quote className="absolute top-5 right-5 w-8 h-8 text-primary/10" />

      <div className="flex items-center gap-4 mb-5">
        <Avatar className="h-12 w-12 ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {testimonial.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground truncate">{testimonial.name}</h3>
            <div className="flex gap-0.5 shrink-0">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          <p className="text-xs text-muted-foreground/70">{testimonial.location}</p>
        </div>
      </div>

      <p className="text-sm text-foreground/85 leading-relaxed mb-4">
        "{testimonial.comment}"
      </p>

      <div className="pt-4 border-t border-border/40">
        <p className="text-xs text-primary/70 font-medium tracking-wide">
          {testimonial.carModel}
        </p>
      </div>
    </div>
  );
}

export function Testimonials() {
  const reviewsSchema = testimonials.map((testimonial) => ({
    "@type": "Review",
    author: { "@type": "Person", name: testimonial.name },
    datePublished: testimonial.date,
    reviewBody: testimonial.comment,
    reviewRating: {
      "@type": "Rating",
      ratingValue: testimonial.rating,
      bestRating: 5,
      worstRating: 1,
    },
    itemReviewed: {
      "@type": "Service",
      name: "Teslys Tesla Car Sharing Service",
      description: "Full-service Tesla rental management platform",
    },
  }));

  const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0);
  const averageRating = totalRating / testimonials.length;

  return (
    <>
      <StructuredData
        type="aggregaterating"
        data={{
          reviews: reviewsSchema,
          ratingValue: averageRating.toFixed(1),
          reviewCount: testimonials.length,
        }}
      />

      <div className="w-full max-w-6xl mx-auto py-16 px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Trusted by Tesla Owners
          </h2>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-foreground">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">out of 5</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on {testimonials.length}+ verified Tesla owner reviews
          </p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </>
  );
}
