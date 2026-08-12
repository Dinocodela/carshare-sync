import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Pencil, Plus, Send } from "lucide-react";
import { StatusPill } from "./StatusPill";
import { ApproveDialog } from "./ApproveDialog";
import { PostEditorDialog } from "./PostEditorDialog";
import {
  DEFAULT_TIMEZONE,
  usePublishNow,
  useSocialAccount,
  useSocialPosts,
  useSocialSettings,
  type PostStatus,
  type SocialPost,
} from "@/hooks/social/useSocial";
import { formatInZone } from "@/lib/socialTime";

const STATUS_FILTERS: (PostStatus | "all")[] = [
  "all",
  "draft",
  "needs_review",
  "approved",
  "scheduled",
  "publishing",
  "published",
  "failed",
  "canceled",
];

export function SocialQueue() {
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveIds, setApproveIds] = useState<string[]>([]);

  const { data: posts, isLoading } = useSocialPosts(statusFilter);
  const { data: settings } = useSocialSettings();
  const { data: account } = useSocialAccount();
  const publishNow = usePublishNow();

  const timezone = settings?.timezone ?? DEFAULT_TIMEZONE;
  const connected = account?.status === "connected";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return posts ?? [];
    return (posts ?? []).filter(
      (p) =>
        (p.title ?? "").toLowerCase().includes(term) ||
        p.caption.toLowerCase().includes(term) ||
        (p.campaign ?? "").toLowerCase().includes(term),
    );
  }, [posts, search]);

  const needsReview = useMemo(
    () => (posts ?? []).filter((p) => p.status === "needs_review"),
    [posts],
  );

  const openApproveAll = () => {
    setApproveIds(needsReview.map((p) => p.id));
    setApproveOpen(true);
  };

  const openApproveOne = (post: SocialPost) => {
    setApproveIds([post.id]);
    setApproveOpen(true);
  };

  const openEditor = (post: SocialPost | null) => {
    setEditingPost(post);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-4">
      {!connected && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Instagram not connected</AlertTitle>
          <AlertDescription>
            Posts can be drafted and approved, but nothing will publish until Instagram is
            connected in Settings.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PostStatus | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "all" ? "All statuses" : status.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search caption, title, campaign"
          className="w-full sm:w-64"
        />

        <div className="ml-auto flex gap-2">
          <Button
            variant="secondary"
            onClick={openApproveAll}
            disabled={needsReview.length === 0}
          >
            Approve all ({needsReview.length})
          </Button>
          <Button onClick={() => openEditor(null)}>
            <Plus className="mr-2 h-4 w-4" /> New post
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading posts…</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No posts yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={post.status as PostStatus} />
                    <span className="text-xs uppercase text-muted-foreground">{post.format}</span>
                    {post.campaign && (
                      <span className="text-xs text-muted-foreground">· {post.campaign}</span>
                    )}
                  </div>
                  <p className="mt-1 truncate font-medium">
                    {post.title || post.caption.slice(0, 70)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.published_at
                      ? `Published ${formatInZone(post.published_at, timezone)}`
                      : post.scheduled_at
                        ? `Scheduled ${formatInZone(post.scheduled_at, timezone)}`
                        : "No schedule"}
                    {post.last_error ? ` · ${post.last_error}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {post.status === "needs_review" && (
                    <Button size="sm" variant="secondary" onClick={() => openApproveOne(post)}>
                      Approve
                    </Button>
                  )}
                  {["approved", "scheduled", "failed"].includes(post.status) && (
                    <Button
                      size="sm"
                      onClick={() => publishNow.mutate(post.id)}
                      disabled={publishNow.isPending || !connected}
                    >
                      <Send className="mr-2 h-4 w-4" /> Publish now
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEditor(post)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PostEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        post={editingPost}
        timezone={timezone}
        defaultCtaKeyword={settings?.default_cta_keyword}
        defaultDestinationUrl={settings?.default_destination_url}
      />
      <ApproveDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        postIds={approveIds}
        subject={approveIds.length === 1 ? "1 post" : `${approveIds.length} posts`}
      />
    </div>
  );
}
