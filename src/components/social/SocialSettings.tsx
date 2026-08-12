import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Instagram } from "lucide-react";
import {
  DEFAULT_TIMEZONE,
  useConnectInstagram,
  useDisconnectInstagram,
  useSocialAccount,
  useSocialSettings,
  useUpdateSocialSettings,
} from "@/hooks/social/useSocial";
import { formatInZone } from "@/lib/socialTime";

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export function SocialSettings() {
  const { data: settings, isLoading } = useSocialSettings();
  const { data: account } = useSocialAccount();
  const updateSettings = useUpdateSocialSettings();
  const connect = useConnectInstagram();
  const disconnect = useDisconnectInstagram();

  const [form, setForm] = useState({
    mode: "review_required",
    allowed_days: [] as string[],
    allowed_start_time: "09:00",
    allowed_end_time: "20:00",
    max_feed_posts_per_day: 2,
    timezone: DEFAULT_TIMEZONE,
    default_cta_keyword: "",
    default_destination_url: "",
    auto_reply_faq: false,
    auto_reply_cta_comments: false,
    escalation_categories: "" as string,
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      mode: settings.mode,
      allowed_days: settings.allowed_days ?? [],
      allowed_start_time: (settings.allowed_start_time ?? "09:00:00").slice(0, 5),
      allowed_end_time: (settings.allowed_end_time ?? "20:00:00").slice(0, 5),
      max_feed_posts_per_day: settings.max_feed_posts_per_day ?? 2,
      timezone: settings.timezone ?? DEFAULT_TIMEZONE,
      default_cta_keyword: settings.default_cta_keyword ?? "",
      default_destination_url: settings.default_destination_url ?? "",
      auto_reply_faq: settings.auto_reply_faq ?? false,
      auto_reply_cta_comments: settings.auto_reply_cta_comments ?? false,
      escalation_categories: (settings.escalation_categories ?? []).join(", "),
    });
  }, [settings]);

  const toggleDay = (day: string) =>
    setForm((prev) => ({
      ...prev,
      allowed_days: prev.allowed_days.includes(day)
        ? prev.allowed_days.filter((d) => d !== day)
        : [...prev.allowed_days, day],
    }));

  const save = () => {
    if (!settings) return;
    updateSettings.mutate({
      id: settings.id,
      mode: form.mode as typeof settings.mode,
      allowed_days: form.allowed_days,
      allowed_start_time: `${form.allowed_start_time}:00`,
      allowed_end_time: `${form.allowed_end_time}:00`,
      max_feed_posts_per_day: Number(form.max_feed_posts_per_day) || 1,
      timezone: form.timezone,
      default_cta_keyword: form.default_cta_keyword.trim() || null,
      default_destination_url: form.default_destination_url.trim() || null,
      auto_reply_faq: form.auto_reply_faq,
      auto_reply_cta_comments: form.auto_reply_cta_comments,
      escalation_categories: form.escalation_categories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  const connected = account?.status === "connected";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" /> Instagram connection
          </CardTitle>
          <CardDescription>
            Publishing and webhooks require a connected Instagram professional account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={connected ? "default" : "destructive"}>
              {account?.status ?? "disconnected"}
            </Badge>
            {account?.ig_username && <span className="text-sm">@{account.ig_username}</span>}
            {account?.token_expires_at && (
              <span className="text-xs text-muted-foreground">
                Token expires {formatInZone(account.token_expires_at, form.timezone)}
              </span>
            )}
          </div>
          {account?.last_error && (
            <p className="text-sm text-destructive">{account.last_error}</p>
          )}
          <div className="flex gap-2">
            <Button onClick={() => connect.mutate()} disabled={connect.isPending}>
              {connected ? "Reconnect" : "Connect Instagram"}
            </Button>
            {account && connected && (
              <Button
                variant="outline"
                onClick={() => disconnect.mutate(account.id)}
                disabled={disconnect.isPending}
              >
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automation</CardTitle>
          <CardDescription>
            Guardrails applied to every scheduled and auto-published post.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading || !settings ? (
            <p className="text-sm text-muted-foreground">Loading settings…</p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <Select
                    value={form.mode}
                    onValueChange={(v) => setForm((p) => ({ ...p, mode: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="review_required">Review required</SelectItem>
                      <SelectItem value="auto_publish_approved">
                        Auto-publish approved posts
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tz">Timezone</Label>
                  <Input
                    id="tz"
                    value={form.timezone}
                    onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allowed days</Label>
                <div className="flex flex-wrap gap-3">
                  {DAYS.map((day) => (
                    <label key={day.key} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={form.allowed_days.includes(day.key)}
                        onCheckedChange={() => toggleDay(day.key)}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Window start</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={form.allowed_start_time}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, allowed_start_time: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">Window end</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={form.allowed_end_time}
                    onChange={(e) => setForm((p) => ({ ...p, allowed_end_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily-cap">Max posts / day</Label>
                  <Input
                    id="daily-cap"
                    type="number"
                    min={1}
                    value={form.max_feed_posts_per_day}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, max_feed_posts_per_day: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="default-cta">Default CTA keyword</Label>
                  <Input
                    id="default-cta"
                    value={form.default_cta_keyword}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, default_cta_keyword: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-url">Default destination URL</Label>
                  <Input
                    id="default-url"
                    value={form.default_destination_url}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, default_destination_url: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-sm">Auto-reply to FAQs</Label>
                    <p className="text-xs text-muted-foreground">Uses reply templates</p>
                  </div>
                  <Switch
                    checked={form.auto_reply_faq}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, auto_reply_faq: v }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-sm">Auto-reply to CTA comments</Label>
                    <p className="text-xs text-muted-foreground">Matches the CTA keyword</p>
                  </div>
                  <Switch
                    checked={form.auto_reply_cta_comments}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, auto_reply_cta_comments: v }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalation">Escalation categories (comma separated)</Label>
                <Input
                  id="escalation"
                  value={form.escalation_categories}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, escalation_categories: e.target.value }))
                  }
                  placeholder="complaint, legal, press"
                />
              </div>

              <Button onClick={save} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Saving…" : "Save settings"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
