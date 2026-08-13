import { useEffect, useState } from "react";
import { Loader2, Rocket } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { WRAP_TEMPLATES } from "@/lib/wrapTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface DropJob {
  id: string;
  status: string;
  template_key: string;
  theme: string | null;
  error: string | null;
  brief: { title?: string; slug?: string } | null;
  created_at: string;
}

const STAGE_LABEL: Record<string, string> = {
  queued: "Queued",
  brief: "Designing",
  texture: "Rendering wrap PNG",
  preview: "Rendering car photos",
  video: "Filming reel",
  listing: "Adding to gallery",
  scheduling: "Scheduling post",
  done: "Published",
  failed: "Failed",
};

const AUTO = "auto";

export function WrapDropPanel() {
  const [jobs, setJobs] = useState<DropJob[]>([]);
  const [templateKey, setTemplateKey] = useState(AUTO);
  const [theme, setTheme] = useState("");
  const [starting, setStarting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("wrap_drop_jobs")
      .select("id, status, template_key, theme, error, brief, created_at")
      .order("created_at", { ascending: false })
      .limit(6);
    setJobs((data as unknown as DropJob[]) ?? []);
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  const runNow = async () => {
    setStarting(true);
    try {
      const { data, error } = await supabase.functions.invoke("wrap-auto-drop", {
        body: {
          mode: "run_now",
          template_key: templateKey === AUTO ? undefined : templateKey,
          theme: theme.trim() || undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.reason === "a_drop_is_already_running") {
        toast.error("A drop is already running", {
          description: "Wait for it to finish or fail before starting another.",
        });
        return;
      }
      toast.success("Wrap drop started", {
        description: "It runs in the background — this panel updates as it goes.",
      });
      setTheme("");
      load();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not start the drop");
    } finally {
      setStarting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Automated daily drop</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Every morning a new wrap is designed, rendered, filmed and posted on its own,
          rotating through the Tesla templates. Use this to run one on demand.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={templateKey} onValueChange={setTemplateKey}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AUTO}>Next in rotation</SelectItem>
                {WRAP_TEMPLATES.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="drop-theme">Theme (optional)</Label>
            <Input
              id="drop-theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="desert camo, liquid chrome…"
            />
          </div>
        </div>

        <Button onClick={runNow} disabled={starting} className="rounded-full">
          {starting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="mr-2 h-4 w-4" />
          )}
          Run drop now
        </Button>

        <div className="space-y-2">
          {jobs.length === 0 && (
            <p className="text-sm text-muted-foreground">No drops yet.</p>
          )}
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border/60 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {job.brief?.title ?? "New design"}{" "}
                  <span className="text-muted-foreground font-normal">
                    · {job.template_key}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  {job.error ? ` · ${job.error}` : ""}
                </p>
              </div>
              <Badge
                variant={
                  job.status === "failed"
                    ? "destructive"
                    : job.status === "done"
                      ? "default"
                      : "secondary"
                }
              >
                {STAGE_LABEL[job.status] ?? job.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
