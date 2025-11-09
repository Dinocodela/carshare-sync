import { Calendar, CircleDollarSign, TrendingUp } from "lucide-react";
import { AppStoreBadges } from "@/components/ui/AppStoreBadges";

export function OnboardingScreen3() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="mb-8 relative">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Calendar className="w-16 h-16 text-primary" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
        Reliable Payments, Every Time
      </h1>
      
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Receive your earnings like clockwork on the 1st and 15th of every month
      </p>

      <div className="space-y-4 text-left max-w-md w-full mb-8">
        <div className="flex items-start gap-3">
          <Calendar className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground">Predictable Income</h3>
            <p className="text-sm text-muted-foreground">Know exactly when your payments arrive</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <CircleDollarSign className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground">Direct Deposits</h3>
            <p className="text-sm text-muted-foreground">Automatic transfers to your account</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground">Full Transparency</h3>
            <p className="text-sm text-muted-foreground">Track your earnings in real-time</p>
          </div>
        </div>
      </div>

      <AppStoreBadges heading="Or download our mobile app" />
    </div>
  );
}
