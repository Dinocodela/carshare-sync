import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialCalendar } from "@/components/social/SocialCalendar";
import { SocialQueue } from "@/components/social/SocialQueue";
import { SocialLeads } from "@/components/social/SocialLeads";
import { SocialSettings } from "@/components/social/SocialSettings";
import { SocialAuditLog } from "@/components/social/SocialAuditLog";
import { PublishAttempts } from "@/components/social/PublishAttempts";

const IG_MESSAGES: Record<string, { title: string; description?: string; type: "success" | "error" }> = {
  connected: { title: "Instagram connected", description: "Your Instagram account is now linked.", type: "success" },
  missing_code: { title: "Instagram connection failed", description: "Authorization was cancelled or incomplete.", type: "error" },
  invalid_state: { title: "Instagram connection failed", description: "The authorization link expired. Please try again.", type: "error" },
  error: { title: "Instagram connection failed", type: "error" },
};

export default function SocialAdmin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const igParam = searchParams.get("ig");
  const [tab, setTab] = useState(igParam ? "settings" : "queue");

  useEffect(() => {
    if (!igParam) return;
    const info = IG_MESSAGES[igParam] ?? {
      title: "Instagram connection failed",
      type: "error" as const,
    };
    const description = searchParams.get("message") ?? info.description;
    if (info.type === "success") toast.success(info.title, { description });
    else toast.error(info.title, { description });

    setTab("settings");
    const next = new URLSearchParams(searchParams);
    next.delete("ig");
    next.delete("message");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igParam]);

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Social</h1>
          <p className="text-muted-foreground">
            Plan, approve, and publish Instagram content, and follow up on inbound leads.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="retries">Retries</TabsTrigger>
            <TabsTrigger value="audit">Audit log</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="mt-4">
            <SocialCalendar />
          </TabsContent>
          <TabsContent value="queue" className="mt-4">
            <SocialQueue />
          </TabsContent>
          <TabsContent value="leads" className="mt-4">
            <SocialLeads />
          </TabsContent>
          <TabsContent value="retries" className="mt-4">
            <PublishAttempts />
          </TabsContent>
          <TabsContent value="audit" className="mt-4">
            <SocialAuditLog />
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <SocialSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
