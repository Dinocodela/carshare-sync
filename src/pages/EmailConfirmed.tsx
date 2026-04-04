import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { CheckCircle } from "lucide-react";

export default function EmailConfirmed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo size="xl" />
        </div>

        <Card className="bg-white/90 border-primary/10 backdrop-blur text-center">
          <CardHeader className="pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Email Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your email has been successfully verified. Your account is now
              under review — an admin will approve it shortly and you'll be
              notified.
            </p>
            <p className="text-muted-foreground text-sm">
              You can sign in to check your account status at any time.
            </p>
            <Button asChild className="w-full">
              <Link to="/">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
