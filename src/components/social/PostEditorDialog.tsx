import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  DEFAULT_TIMEZONE,
  usePostAssets,
  useSavePost,
  type PostFormat,
  type SocialPost,
} from "@/hooks/social/useSocial";
import { utcISOToZonedParts, zonedWallClockToUtcISO } from "@/lib/socialTime";

interface PostEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: SocialPost | null;
  timezone?: string;
  defaultCtaKeyword?: string | null;
  defaultDestinationUrl?: string | null;
}

export function PostEditorDialog({
  open,
  onOpenChange,
  post,
  timezone = DEFAULT_TIMEZONE,
  defaultCtaKeyword,
  defaultDestinationUrl,
}: PostEditorDialogProps) {
  const savePost = useSavePost();
  const qc = useQueryClient();
  const { data: assets } = usePostAssets(post?.id);

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [format, setFormat] = useState<PostFormat>("image");
  const [ctaKeyword, setCtaKeyword] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [firstComment, setFirstComment] = useState("");
  const [campaign, setCampaign] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [aiDisclosure, setAiDisclosure] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [uploading, setUploading] = useState(false);

  const initialSchedule = useMemo(
    () => utcISOToZonedParts(post?.scheduled_at, timezone),
    [post?.scheduled_at, timezone],
  );

  useEffect(() => {
    if (!open) return;
    setTitle(post?.title ?? "");
    setCaption(post?.caption ?? "");
    setHashtags((post?.hashtags ?? []).join(" "));
    setFormat((post?.format as PostFormat) ?? "image");
    setCtaKeyword(post?.cta_keyword ?? defaultCtaKeyword ?? "");
    setDestinationUrl(post?.destination_url ?? defaultDestinationUrl ?? "");
    setFirstComment(post?.first_comment ?? "");
    setCampaign(post?.campaign ?? "");
    setInternalNotes(post?.internal_notes ?? "");
    setAiDisclosure(post?.ai_disclosure ?? false);
    setDate(initialSchedule.date);
    setTime(initialSchedule.time);
  }, [open, post, defaultCtaKeyword, defaultDestinationUrl, initialSchedule]);

  const handleUpload = async (file: File) => {
    if (!post?.id) {
      toast.error("Save the post first, then add media");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${post.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("social-media")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: userData } = await supabase.auth.getUser();
      const { error: insertError } = await supabase.from("social_media_assets").insert({
        post_id: post.id,
        storage_path: path,
        kind: file.type.startsWith("video") ? "video" : "image",
        mime_type: file.type,
        bytes: file.size,
        position: assets?.length ?? 0,
        created_by: userData.user?.id ?? null,
      });
      if (insertError) throw insertError;

      qc.invalidateQueries({ queryKey: ["social", "assets", post.id] });
      toast.success("Media uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const removeAsset = async (assetId: string, storagePath: string) => {
    await supabase.storage.from("social-media").remove([storagePath]);
    const { error } = await supabase.from("social_media_assets").delete().eq("id", assetId);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["social", "assets", post?.id] });
  };

  const handleSave = async (submitForReview: boolean) => {
    if (!caption.trim()) {
      toast.error("Caption is required");
      return;
    }

    const hadSchedule = !!post?.scheduled_at;
    const hasSchedule = !!date && !!time;

    await savePost.mutateAsync({
      id: post?.id,
      title: title.trim() || null,
      caption: caption.trim(),
      hashtags: hashtags
        .split(/[\s,]+/)
        .map((tag) => tag.replace(/^#/, "").trim())
        .filter(Boolean),
      format,
      cta_keyword: ctaKeyword.trim() || null,
      destination_url: destinationUrl.trim() || null,
      first_comment: firstComment.trim() || null,
      campaign: campaign.trim() || null,
      internal_notes: internalNotes.trim() || null,
      ai_disclosure: aiDisclosure,
      timezone,
      scheduled_at: hasSchedule ? zonedWallClockToUtcISO(date, time, timezone) : undefined,
      // Only an explicit clear (schedule existed, admin emptied the fields) nulls it out.
      clear_schedule: hadSchedule && !hasSchedule,
      submit_for_review: submitForReview,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{post ? "Edit post" : "New post"}</DialogTitle>
          <DialogDescription>
            Scheduling uses {timezone} wall-clock time and is stored in UTC.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="post-title">Internal title</Label>
                <Input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as PostFormat)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                    <SelectItem value="reel">Reel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-caption">Caption</Label>
              <Textarea
                id="post-caption"
                rows={5}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-hashtags">Hashtags</Label>
              <Input
                id="post-hashtags"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="tesla losangeles carsharing"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="post-cta">CTA keyword</Label>
                <Input
                  id="post-cta"
                  value={ctaKeyword}
                  onChange={(e) => setCtaKeyword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-url">Destination URL</Label>
                <Input
                  id="post-url"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-first-comment">First comment</Label>
              <Textarea
                id="post-first-comment"
                rows={2}
                value={firstComment}
                onChange={(e) => setFirstComment(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="post-date">Scheduled date ({timezone})</Label>
                <Input
                  id="post-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-time">Scheduled time</Label>
                <Input
                  id="post-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="post-campaign">Campaign</Label>
                <Input
                  id="post-campaign"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="post-ai" className="text-sm">
                    AI disclosure
                  </Label>
                  <p className="text-xs text-muted-foreground">Content is AI-generated</p>
                </div>
                <Switch id="post-ai" checked={aiDisclosure} onCheckedChange={setAiDisclosure} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-notes">Internal notes</Label>
              <Textarea
                id="post-notes"
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Media</Label>
              {post?.id ? (
                <div className="space-y-2">
                  {(assets ?? []).map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="truncate">
                        <Badge variant="secondary" className="mr-2">
                          {asset.kind}
                        </Badge>
                        {asset.storage_path.split("/").pop()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAsset(asset.id, asset.storage_path)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground hover:bg-muted/50">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading…" : "Upload image or video"}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Save the post as a draft first, then upload media.
                </p>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSave(false)}
            disabled={savePost.isPending}
          >
            Save draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={savePost.isPending}>
            Submit for review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
