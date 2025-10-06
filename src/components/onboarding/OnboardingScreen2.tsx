import { Shield, Users, Wrench } from "lucide-react";

export function OnboardingScreen2() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="mb-8 relative">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Shield className="w-16 h-16 text-primary" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
        We Handle Everything
      </h1>
      
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        From guest screening to maintenance coordination, Teslys manages 100% of the operations
      </p>

      <div className="space-y-4 text-left max-w-md w-full">
        <div className="flex items-start gap-3">
          <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground">No Phone Calls</h3>
            <p className="text-sm text-muted-foreground">We screen and manage all guests</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground">No Scheduling Hassles</h3>
            <p className="text-sm text-muted-foreground">Our team coordinates everything</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Wrench className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground">Professional Management</h3>
            <p className="text-sm text-muted-foreground">Insurance, maintenance, and support included</p>
          </div>
        </div>
      </div>
    </div>
  );
}
