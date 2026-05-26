import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

type AuditEntry = {
  id: string;
  created_at: string;
  host_id: string;
  car_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: any;
};

const actionLabel = (action: string) => {
  const map: Record<string, string> = {
    request_accepted: "Accepted hosting request",
    request_rejected: "Declined hosting request",
    earning_created: "Added earning",
    earning_updated: "Edited earning",
    earning_deleted: "Deleted earning",
    expense_created: "Added expense",
    expense_updated: "Edited expense",
    expense_deleted: "Deleted expense",
    claim_created: "Added claim",
    claim_updated: "Edited claim",
    claim_deleted: "Deleted claim",
  };
  return map[action] ?? action;
};

const actionTone = (action: string) => {
  if (action.endsWith("_deleted") || action === "request_rejected") return "destructive";
  if (action.endsWith("_created") || action === "request_accepted") return "default";
  return "secondary";
};

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("host_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (!error && data) setEntries(data as AuditEntry[]);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground mt-1">
          Every host action is recorded here with a timestamp.
        </p>
      </header>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No audit entries yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  {actionLabel(e.action)}
                </CardTitle>
                <Badge variant={actionTone(e.action) as any}>{e.entity_type}</Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div>
                  {format(new Date(e.created_at), "PPpp")}
                </div>
                {e.entity_id && (
                  <div className="font-mono text-xs mt-1 break-all">
                    {e.entity_type} id: {e.entity_id}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
