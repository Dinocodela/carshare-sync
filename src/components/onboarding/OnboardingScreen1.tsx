import { DollarSign, TrendingUp, Clock } from "lucide-react";

export function OnboardingScreen1() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="mb-8 relative">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <DollarSign className="w-16 h-16 text-primary" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
        Your Tesla Makes Money While You Sleep
      </h1>
      
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Turn your idle asset into a passive income stream without lifting a finger
      </p>

      <div className="space-y-4 text-left max-w-md w-full">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground">Earn Daily</h3>
            <p className="text-sm text-muted-foreground">Every day your Tesla is working for you</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground">Zero Effort Required</h3>
            <p className="text-sm text-muted-foreground">We handle everything from start to finish</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <DollarSign className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground">Your Car Works for You</h3>
            <p className="text-sm text-muted-foreground">Passive income while maintaining ownership</p>
          </div>
        </div>
      </div>
    </div>
  );
}
