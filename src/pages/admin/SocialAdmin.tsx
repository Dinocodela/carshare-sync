import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialCalendar } from "@/components/social/SocialCalendar";
import { SocialQueue } from "@/components/social/SocialQueue";
import { SocialLeads } from "@/components/social/SocialLeads";
import { SocialSettings } from "@/components/social/SocialSettings";
import { SocialAuditLog } from "@/components/social/SocialAuditLog";
import { PublishAttempts } from "@/components/social/PublishAttempts";

export default function SocialAdmin() {
  const navigate = useNavigate();

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

        <Tabs defaultValue="queue">
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
