import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useSocialAuditLog } from "@/hooks/social/useSocialAudit";
import { DEFAULT_TIMEZONE, useSocialSettings } from "@/hooks/social/useSocial";
import { formatInZone } from "@/lib/socialTime";

const ENTITY_TYPES = ["all", "post", "account", "lead", "settings", "approval"];

export function SocialAuditLog() {
  const [entityType, setEntityType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { data: entries, isLoading } = useSocialAuditLog({ entityType });
  const { data: settings } = useSocialSettings();
  const timezone = settings?.timezone ?? DEFAULT_TIMEZONE;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return entries ?? [];
    return (entries ?? []).filter(
      (e) =>
        e.action.toLowerCase().includes(term) ||
        e.entity_type.toLowerCase().includes(term) ||
        (e.actor_email ?? "").toLowerCase().includes(term) ||
        (e.entity_id ?? "").toLowerCase().includes(term),
    );
  }, [entries, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "all" ? "All entities" : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search action, actor, id"
          className="w-full sm:w-72"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading audit log…</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No audit entries yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <Collapsible key={entry.id}>
              <Card>
                <CardContent className="py-3">
                  <CollapsibleTrigger className="flex w-full items-start gap-3 text-left">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{entry.entity_type}</Badge>
                        <span className="text-sm font-medium">{entry.action}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {formatInZone(entry.created_at, timezone)}
                        {entry.actor_email ? ` · ${entry.actor_email}` : ""}
                        {entry.entity_id ? ` · ${entry.entity_id}` : ""}
                      </p>
                    </div>
                    <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 grid gap-3 sm:grid-cols-2">
                    <StateBlock label="Before" value={entry.before_state} />
                    <StateBlock label="After" value={entry.after_state} />
                    {entry.metadata ? (
                      <div className="sm:col-span-2">
                        <StateBlock label="Metadata" value={entry.metadata} />
                      </div>
                    ) : null}
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}

function StateBlock({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="rounded-md bg-muted/50 p-3">
      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
