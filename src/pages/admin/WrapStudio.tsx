import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, Upload, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAllWrapDesigns } from "@/hooks/useWrapDesigns";
import {
  DEFAULT_TEMPLATE_KEY,
  WRAP_TEMPLATES,
  getTemplate,
} from "@/lib/wrapTemplates";
import {
  ComposedWrap,
  composeWrap,
  formatBytes,
  slugify,
} from "@/lib/wrapCompositor";
import { WRAP_CATEGORIES } from "@/data/wraps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const categories = WRAP_CATEGORIES.filter((c) => c !== "All") as string[];

export default function WrapStudio() {
  const queryClient = useQueryClient();
  const { data: designs, isLoading } = useAllWrapDesigns();
  const fileInput = useRef<HTMLInputElement>(null);

  const [templateKey, setTemplateKey] = useState(DEFAULT_TEMPLATE_KEY);
  const [prompt, setPrompt] = useState("");
  const [artSrc, setArtSrc] = useState<string | null>(null);
  const [composed, setComposed] = useState<ComposedWrap | null>(null);
  const [generating, setGenerating] = useState(false);
  const [composing, setComposing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Featured");
  const [published, setPublished] = useState(true);

  const template = useMemo(() => getTemplate(templateKey), [templateKey]);
  const slug = slugify(title);

  const runCompose = async (src: string, key: string) => {
    setComposing(true);
    try {
      setComposed(await composeWrap(src, key));
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not build the wrap");
    } finally {
      setComposing(false);
    }
  };

  const onTemplateChange = (key: string) => {
    setTemplateKey(key);
    if (artSrc) void runCompose(artSrc, key);
  };

  const onUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setArtSrc(src);
      void runCompose(src, templateKey);
    };
    reader.readAsDataURL(file);
  };

  const onGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Describe the artwork first");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("wrap-generate-art", {
        body: { prompt },
      });
      if (error) throw error;
      if (!data?.dataUrl) throw new Error("No artwork returned");
      setArtSrc(data.dataUrl);
      await runCompose(data.dataUrl, templateKey);
      toast.success("Artwork generated");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const onPublish = async () => {
    if (!composed) return toast.error("Build the wrap first");
    if (!title.trim() || !slug) return toast.error("Give the wrap a title");
    if (!description.trim()) return toast.error("Add a short description");

    setPublishing(true);
    try {
      const pngPath = `designs/${slug}/${slug}.png`;
      const previewPath = `designs/${slug}/${slug}-preview.jpg`;

      const up1 = await supabase.storage
        .from("wraps")
        .upload(pngPath, composed.png, {
          contentType: "image/png",
          upsert: true,
        });
      if (up1.error) throw up1.error;

      const up2 = await supabase.storage
        .from("wraps")
        .upload(previewPath, composed.preview, {
          contentType: "image/jpeg",
          upsert: true,
        });
      if (up2.error) throw up2.error;

      const { error } = await supabase.from("wrap_designs").upsert(
        {
          slug,
          title: title.trim(),
          description: description.trim(),
          category,
          model_key: templateKey,
          png_path: pngPath,
          preview_path: previewPath,
          dimensions: `${composed.width} × ${composed.height} px`,
          file_size: formatBytes(composed.png.size),
          compatibility: template.compatibility,
          source_prompt: prompt || null,
          storage_kind: "storage",
          published,
        },
        { onConflict: "slug" }
      );
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["wrap-designs"] });
      toast.success(published ? "Wrap published" : "Wrap saved as draft");
      setTitle("");
      setDescription("");
      setArtSrc(null);
      setComposed(null);
      setPrompt("");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const togglePublished = async (id: string, next: boolean) => {
    const { error } = await supabase
      .from("wrap_designs")
      .update({ published: next })
      .eq("id", id);
    if (error) return toast.error(error.message);
    await queryClient.invalidateQueries({ queryKey: ["wrap-designs"] });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Wrap Studio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate or upload artwork, mask it to Tesla's official UV template, and
          publish it to the free wraps catalog.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1 · Artwork</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Vehicle template</Label>
              <Select value={templateKey} onValueChange={onTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WRAP_TEMPLATES.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Official Tesla UV template · {template.width} × {template.height} px
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Describe the design</Label>
              <Textarea
                id="prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Satin black with cyan and magenta racing stripes running front to back"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={onGenerate} disabled={generating}>
                  {generating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate artwork
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInput.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload art
                </Button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files?.[0])}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wand2 className="h-4 w-4" />2 · Masked result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-muted/40 aspect-[3/2] flex items-center justify-center overflow-hidden">
              {composing ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : composed ? (
                <img
                  src={composed.previewDataUrl}
                  alt="Masked wrap preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <p className="text-sm text-muted-foreground px-6 text-center">
                  Generate or upload artwork to see it masked to the template.
                </p>
              )}
            </div>
            {composed && (
              <p className="text-xs text-muted-foreground tabular-nums">
                UV texture: {composed.width} × {composed.height} px · PNG ·{" "}
                {formatBytes(composed.png.size)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3 · Publish</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Neon Velocity"
              />
              {slug && (
                <p className="text-xs text-muted-foreground">/wraps/{slug}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short, benefit-led description shown on the gallery card."
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={published} onCheckedChange={setPublished} id="pub" />
            <Label htmlFor="pub">Publish immediately</Label>
          </div>
          <Button onClick={onPublish} disabled={publishing || !composed}>
            {publishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save wrap
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <ul className="divide-y">
              {(designs ?? []).map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getTemplate(d.model_key).label} · {d.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={d.published ? "default" : "secondary"}>
                      {d.published ? "Live" : "Draft"}
                    </Badge>
                    <Switch
                      checked={d.published}
                      onCheckedChange={(v) => togglePublished(d.id, v)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
