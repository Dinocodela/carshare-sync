import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
});

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const validation = emailSchema.safeParse({ email });
    
    if (!validation.success) {
      toast({
        title: "Invalid Email",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscriptions")
        .insert({
          email: validation.data.email.toLowerCase(),
          source: "blog"
        });

      if (error) {
        // Check for duplicate email
        if (error.code === "23505") {
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to our newsletter.",
          });
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        setEmail("");
        toast({
          title: "Successfully Subscribed!",
          description: "Thank you for subscribing to our newsletter.",
        });
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: "Failed to subscribe. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-primary">
            <Check className="w-6 h-6" />
            <p className="font-medium">
              You're subscribed! Check your email for confirmation.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/5 border-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          <CardTitle>Subscribe to Our Newsletter</CardTitle>
        </div>
        <CardDescription>
          Get the latest Tesla car sharing tips, passive income strategies, and industry insights delivered to your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newsletter-email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="newsletter-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                maxLength={255}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !email}
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
