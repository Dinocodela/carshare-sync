import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload,
  X,
  Trash2,
  Camera,
  Image,
  CarIcon,
  ChevronLeft,
  Shield,
  Lock,
  CheckCircle,
  MapPin,
  Palette,
  FileText,
  Hash,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCameraCapture } from "@/hooks/useCameraCapture";

const carSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900, "Invalid year").max(new Date().getFullYear() + 1, "Invalid year"),
  mileage: z.number().min(0, "Mileage must be positive"),
  color: z.string().min(1, "Color is required"),
  location: z.string().min(1, "Location is required"),
  license_plate: z.string().min(1, "License plate is required"),
  vin_number: z.string().min(1, "VIN number is required"),
  description: z.string().optional(),
});

type CarFormData = z.infer<typeof carSchema>;

interface CarData extends CarFormData {
  id: string;
  images: string[] | null;
  status: string;
  created_at: string;
  host_id: string | null;
}

export default function EditCar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { takePhoto, selectFromGallery, showActionSheet, convertPhotoToFile, isCapturing, isNative } = useCameraCapture();

  const form = useForm<CarFormData>({ resolver: zodResolver(carSchema) });

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const fadeIn = (idx: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(12px)",
    transition: `all 500ms cubic-bezier(0.23,1,0.32,1) ${idx * 80}ms`,
  });

  useEffect(() => { if (id) fetchCar(); }, [id, user]);

  const fetchCar = async () => {
    if (!user || !id) return;
    try {
      const { data, error } = await supabase.from("cars").select("*").eq("id", id).eq("client_id", user.id).single();
      if (error) throw error;
      form.reset({
        make: data.make, model: data.model, year: data.year, mileage: data.mileage || 0,
        color: data.color, location: data.location, license_plate: data.license_plate || "",
        vin_number: data.vin_number || "", description: data.description || "",
      });
      setExistingImages(data.images || []);
    } catch (error) {
      console.error("Error fetching car:", error);
      toast({ title: "Error loading car", description: "Unable to load car details. Please try again.", variant: "destructive" });
      navigate("/my-cars");
    } finally { setLoading(false); }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedImages((prev) => [...prev, ...files].slice(0, 5));
  };
  const removeImage = (index: number) => setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  const removeExistingImage = (index: number) => setExistingImages((prev) => prev.filter((_, i) => i !== index));

  const handleCameraCapture = async () => {
    const photo = await showActionSheet({ quality: 90, allowEditing: true });
    if (photo) {
      const file = await convertPhotoToFile(photo, `car-photo-${Date.now()}.jpg`);
      if (file) {
        if (existingImages.length + selectedImages.length >= 5) {
          toast({ title: "Too many images", description: "You can have a maximum of 5 images per car.", variant: "destructive" });
          return;
        }
        setSelectedImages((prev) => [...prev, file]);
      }
    }
  };

  const handleGallerySelect = async () => {
    const photo = await selectFromGallery({ quality: 90, allowEditing: true });
    if (photo) {
      const file = await convertPhotoToFile(photo, `car-photo-${Date.now()}.jpg`);
      if (file) {
        if (existingImages.length + selectedImages.length >= 5) {
          toast({ title: "Too many images", description: "You can have a maximum of 5 images per car.", variant: "destructive" });
          return;
        }
        setSelectedImages((prev) => [...prev, file]);
      }
    }
  };

  const uploadImages = async (carId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of selectedImages) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${carId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `car-images/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("cars").upload(filePath, file);
      if (uploadError) { console.error("Error uploading file:", uploadError); continue; }
      const { data: urlData } = supabase.storage.from("cars").getPublicUrl(filePath);
      uploadedUrls.push(urlData.publicUrl);
    }
    return uploadedUrls;
  };

  const onSubmit = async (data: CarFormData) => {
    if (!user || !id) return;
    setIsSubmitting(true);
    try {
      const newImageUrls = selectedImages.length > 0 ? await uploadImages(id) : [];
      const allImages = [...existingImages, ...newImageUrls];
      const { error } = await supabase.from("cars").update({
        make: data.make, model: data.model, year: data.year, mileage: data.mileage,
        color: data.color, location: data.location, license_plate: data.license_plate,
        vin_number: data.vin_number, description: data.description,
        images: allImages.length > 0 ? allImages : null, updated_at: new Date().toISOString(),
      }).eq("id", id).eq("client_id", user.id);
      if (error) throw error;
      toast({ title: "Car updated successfully!", description: "Your car details have been updated." });
      navigate("/my-cars");
    } catch (error) {
      console.error("Error updating car:", error);
      toast({ title: "Error updating car", description: "Please try again later.", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!user || !id) return;
    try {
      const { error } = await supabase.from("cars").delete().eq("id", id).eq("client_id", user.id);
      if (error) throw error;
      toast({ title: "Car deleted successfully!", description: "Your car has been removed from the platform." });
      navigate("/my-cars");
    } catch (error) {
      console.error("Error deleting car:", error);
      toast({ title: "Error deleting car", description: "Please try again later.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Loading car details...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-0 space-y-5 pb-8">
        {/* Header */}
        <header style={fadeIn(0)} className="flex items-center justify-between gap-2 py-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back" className="h-9 w-9 rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Edit Car</h1>
          <div className="h-9 w-9" />
        </header>

        {/* Trust Banner */}
        <div style={fadeIn(1)} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-primary/15 p-2.5">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Update Your Listing</h2>
              <p className="text-sm text-muted-foreground">Your changes are saved securely</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            {[
              { icon: Lock, label: "Secure Upload" },
              { icon: Shield, label: "Verified Listing" },
              { icon: CheckCircle, label: "Host Protected" },
            ].map(({ icon: BadgeIcon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-muted-foreground">
                <BadgeIcon className="h-3.5 w-3.5 text-primary/70" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Vehicle Details */}
            <div style={fadeIn(2)} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-4">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="rounded-lg bg-primary/10 p-2"><CarIcon className="h-4 w-4 text-primary" /></div>
                <h2 className="text-base font-semibold tracking-tight">Vehicle Details</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField control={form.control} name="make" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Make *</FormLabel><FormControl><Input placeholder="Toyota" {...field} className="rounded-xl bg-background/50" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="model" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Model *</FormLabel><FormControl><Input placeholder="Camry" {...field} className="rounded-xl bg-background/50" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField control={form.control} name="year" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Year *</FormLabel><FormControl>
                    <Input type="number" placeholder="2020" {...field} value={field.value === 0 ? "" : field.value}
                      onChange={(e) => { const v = e.target.value; field.onChange(v === "" || isNaN(Number(v)) ? 0 : Number(v)); }}
                      onBlur={(e) => { if (e.target.value === "") field.onChange(0); }}
                      className="rounded-xl bg-background/50" />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="mileage" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Mileage *</FormLabel><FormControl>
                    <Input type="number" placeholder="50000" {...field} value={field.value === 0 ? "" : field.value}
                      onChange={(e) => { const v = e.target.value; field.onChange(v === "" || isNaN(Number(v)) ? 0 : Number(v)); }}
                      onBlur={(e) => { if (e.target.value === "") field.onChange(0); }}
                      className="rounded-xl bg-background/50" />
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>

            {/* Identification */}
            <div style={fadeIn(3)} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-4">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="rounded-lg bg-primary/10 p-2"><Shield className="h-4 w-4 text-primary" /></div>
                <h2 className="text-base font-semibold tracking-tight">Identification</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField control={form.control} name="color" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Color *</FormLabel><FormControl>
                    <div className="relative"><Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" /><Input placeholder="Silver" {...field} className="pl-9 rounded-xl bg-background/50" /></div>
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Location *</FormLabel><FormControl>
                    <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" /><Input placeholder="New York, NY" {...field} className="pl-9 rounded-xl bg-background/50" /></div>
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField control={form.control} name="license_plate" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">License Plate *</FormLabel><FormControl>
                    <div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" /><Input placeholder="ABC-1234" {...field} className="pl-9 rounded-xl bg-background/50" /></div>
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="vin_number" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">VIN Number *</FormLabel><FormControl>
                    <div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" /><Input placeholder="1HGBH41JXMN109186" {...field} className="pl-9 rounded-xl bg-background/50" /></div>
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>

            {/* Photos */}
            <div style={fadeIn(4)} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-4">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="rounded-lg bg-primary/10 p-2"><Image className="h-4 w-4 text-primary" /></div>
                <h2 className="text-base font-semibold tracking-tight">Photos</h2>
              </div>

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Current Images</p>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden border border-border/50">
                        <img src={image} alt={`Vehicle photo ${index + 1}`} className="w-full aspect-square object-cover" />
                        <Button type="button" variant="destructive" size="sm" className="absolute top-1.5 right-1.5 h-6 w-6 p-0 rounded-lg" onClick={() => removeExistingImage(index)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Native camera buttons */}
              {isNative && (
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" onClick={handleCameraCapture}
                    disabled={isCapturing || existingImages.length + selectedImages.length >= 5}
                    className="h-20 flex flex-col gap-2 rounded-xl bg-background/50 border-border/40">
                    <Camera className="h-6 w-6 text-primary" /><span className="text-xs">Take Photo</span>
                  </Button>
                  <Button type="button" variant="outline" onClick={handleGallerySelect}
                    disabled={isCapturing || existingImages.length + selectedImages.length >= 5}
                    className="h-20 flex flex-col gap-2 rounded-xl bg-background/50 border-border/40">
                    <Image className="h-6 w-6 text-primary" /><span className="text-xs">Gallery</span>
                  </Button>
                </div>
              )}

              {/* Upload zone */}
              <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.02] p-6 text-center hover:border-primary/40 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-primary/40" />
                <p className="text-sm text-muted-foreground mb-3">Click to upload or drag and drop</p>
                <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" id="image-upload" />
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => document.getElementById("image-upload")?.click()}>
                  Choose Files
                </Button>
              </div>

              {/* New image previews */}
              {selectedImages.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">New Images</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden border border-border/50">
                        <img src={URL.createObjectURL(file)} alt={`New photo ${index + 1}`} className="w-full aspect-square object-cover" />
                        <Button type="button" variant="destructive" size="sm" className="absolute top-1.5 right-1.5 h-6 w-6 p-0 rounded-lg" onClick={() => removeImage(index)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={fadeIn(5)} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-4">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="rounded-lg bg-primary/10 p-2"><FileText className="h-4 w-4 text-primary" /></div>
                <h2 className="text-base font-semibold tracking-tight">Description</h2>
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormControl>
                  <Textarea placeholder="Tell us about your car..." className="min-h-[100px] rounded-xl bg-background/50" {...field} />
                </FormControl><FormMessage /></FormItem>
              )} />
            </div>

            {/* Trust footer */}
            <div style={fadeIn(6)} className="flex flex-wrap justify-center gap-4 py-2 text-xs text-muted-foreground">
              {[
                { icon: Lock, label: "Data encrypted" },
                { icon: Shield, label: "Verified by Teslys" },
              ].map(({ icon: TIcon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <TIcon className="h-3.5 w-3.5 text-primary/60" />{label}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div style={fadeIn(7)} className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/my-cars")} className="flex-1 rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl">
                {isSubmitting ? "Updating..." : "Update Car"}
              </Button>
            </div>

            {/* Delete zone */}
            <div style={fadeIn(8)} className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full rounded-xl text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" />Delete Car
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your car and remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Car
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
