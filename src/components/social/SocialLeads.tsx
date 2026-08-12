import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_TIMEZONE,
  useLeadInteractions,
  useSocialLeads,
  useSocialSettings,
  useUpdateLead,
  type LeadStage,
  type SocialLead,
} from "@/hooks/social/useSocial";
import { formatInZone } from "@/lib/socialTime";

const STAGES: LeadStage[] = [
  "new",
  "contacted",
  "qualified",
  "checkout_started",
  "customer",
  "not_interested",
  "escalated",
];

const STAGE_LABEL: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  checkout_started: "Checkout started",
  customer: "Customer",
  not_interested: "Not interested",
  escalated: "Escalated",
};

export function SocialLeads() {
  const { data: leads, isLoading } = useSocialLeads();
  const { data: settings } = useSocialSettings();
  const updateLead = useUpdateLead();
  const [stageFilter, setStageFilter] = useState<LeadStage | "all">("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<SocialLead | null>(null);

  const timezone = settings?.timezone ?? DEFAULT_TIMEZONE;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (leads ?? []).filter((lead) => {
      if (stageFilter !== "all" && lead.stage !== stageFilter) return false;
      if (!term) return true;
      return (
        (lead.ig_username ?? "").toLowerCase().includes(term) ||
        (lead.cta_keyword ?? "").toLowerCase().includes(term) ||
        (lead.conversation_summary ?? "").toLowerCase().includes(term)
      );
    });
  }, [leads, stageFilter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as LeadStage | "all")}>
          <SelectTrigger className="w-[190px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {STAGES.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {STAGE_LABEL[stage]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search username, keyword, summary"
          className="w-full sm:w-64"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading leads…</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No leads yet. They appear here as Instagram comments and DMs come in.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <Card key={lead.id} className="cursor-pointer" onClick={() => setActive(lead)}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">@{lead.ig_username ?? "unknown"}</span>
                    <Badge variant="secondary">{STAGE_LABEL[lead.stage as LeadStage]}</Badge>
                    <Badge variant="outline">{lead.source}</Badge>
                    {lead.cta_keyword && (
                      <span className="text-xs text-muted-foreground">
                        keyword: {lead.cta_keyword}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {lead.conversation_summary ?? "No summary yet"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last activity {formatInZone(lead.last_interaction_at, timezone)}
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()} className="w-full sm:w-[190px]">
                  <Select
                    value={lead.stage as LeadStage}
                    onValueChange={(value) =>
                      updateLead.mutate({ id: lead.id, stage: value as LeadStage })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {STAGE_LABEL[stage]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LeadDetailDialog
        lead={active}
        timezone={timezone}
        onOpenChange={(open) => !open && setActive(null)}
      />
    </div>
  );
}

function LeadDetailDialog({
  lead,
  timezone,
  onOpenChange,
}: {
  lead: SocialLead | null;
  timezone: string;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: interactions } = useLeadInteractions(lead?.id);
  const updateLead = useUpdateLead();
  const [summary, setSummary] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const open = !!lead;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next && lead) {
          setSummary(lead.conversation_summary ?? "");
          setAssignedTo(lead.assigned_to ?? "");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>@{lead?.ig_username ?? "Lead"}</DialogTitle>
        </DialogHeader>

        {lead && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lead-assigned">Assigned to</Label>
              <Input
                id="lead-assigned"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Team member"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-summary">Conversation summary</Label>
              <Textarea
                id="lead-summary"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
            <Button
              onClick={() =>
                updateLead.mutate({
                  id: lead.id,
                  conversation_summary: summary.trim() || null,
                  assigned_to: assignedTo.trim() || null,
                })
              }
              disabled={updateLead.isPending}
            >
              Save
            </Button>

            <div className="space-y-2">
              <Label>Interactions</Label>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {(interactions ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No interactions recorded.</p>
                ) : (
                  (interactions ?? []).map((item: Record<string, unknown>) => (
                    <div key={String(item.id)} className="rounded-md border p-2 text-sm">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{String(item.channel)}</Badge>
                        <span>{String(item.direction)}</span>
                        <span>{formatInZone(String(item.created_at), timezone)}</span>
                      </div>
                      <p className="mt-1">{String(item.message ?? "")}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
