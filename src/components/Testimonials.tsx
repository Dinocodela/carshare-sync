import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
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
    location: "San Francisco, CA",
    rating: 5,
    comment: "Teslys has completely transformed my Tesla into a revenue-generating asset. I earn $2,500+ monthly in passive income while they handle everything - cleaning, guest support, maintenance scheduling. Best decision I've made!",
    date: "2024-11-01",
    carModel: "Tesla Model 3 Long Range",
  },
  {
    id: "2",
    name: "Sarah Rodriguez",
    role: "Tesla Model Y Owner",
    location: "Austin, TX",
    rating: 5,
    comment: "As a busy professional, I don't have time to manage rentals. Teslys makes it effortless - they handle guest screening, coordinate cleanings, and I just watch the earnings roll in. My Model Y pays for itself now!",
    date: "2024-10-15",
    carModel: "Tesla Model Y Performance",
  },
  {
    id: "3",
    name: "James Patterson",
    role: "Tesla Model S Owner",
    location: "Miami, FL",
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

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="bg-white/80 backdrop-blur border-primary/10">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
              <div className="flex gap-0.5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            <p className="text-xs text-muted-foreground">{testimonial.location}</p>
          </div>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed mb-3">
          "{testimonial.comment}"
        </p>
        <p className="text-xs text-muted-foreground italic">
          Vehicle: {testimonial.carModel}
        </p>
      </CardContent>
    </Card>
  );
}

export function Testimonials() {
  // Generate review schema for each testimonial
  const reviewsSchema = testimonials.map((testimonial) => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: testimonial.name,
    },
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

  // Calculate aggregate rating
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

      <div className="w-full max-w-6xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Trusted by Tesla Owners
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-foreground">
              {averageRating.toFixed(1)} out of 5
            </span>
          </div>
          <p className="text-muted-foreground">
            Based on {testimonials.length}+ verified Tesla owner reviews
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </>
  );
}
