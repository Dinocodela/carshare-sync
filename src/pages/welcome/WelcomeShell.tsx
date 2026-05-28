import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useWorkspace, WORKSPACE_HOME, type WorkspaceRole } from "@/hooks/useWorkspace";

interface WelcomeShellProps {
  role: WorkspaceRole;
  title: string;
  tagline: string;
  intro: string;
  bullets: { title: string; body: string }[];
  ctaLabel: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export function WelcomeShell({
  role,
  title,
  tagline,
  intro,
  bullets,
  ctaLabel,
  Icon,
}: WelcomeShellProps) {
  const navigate = useNavigate();
  const { markLandingSeen, availableRoles } = useWorkspace();
  const row = availableRoles.find((r) => r.role === role);
  const pending = row?.status === "pending";

  const handleContinue = async () => {
    await markLandingSeen(role);
    navigate(WORKSPACE_HOME[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {tagline}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
          </div>
        </div>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{intro}</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {bullets.map((b) => (
            <Card key={b.title}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-1">{b.title}</div>
                    <div className="text-sm text-muted-foreground">{b.body}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {pending ? (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Approval pending</h3>
              <p className="text-sm text-muted-foreground">
                This workspace requires admin approval before you can fully use it.
                We'll email you the moment it's ready.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Button size="lg" onClick={handleContinue} className="w-full sm:w-auto">
            {ctaLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
