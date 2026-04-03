import { useState, useEffect } from "react";
import { CoHostAgreementModal } from "@/components/agreements/CoHostAgreementModal";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Car,
  Upload,
  X,
  Camera,
  Image as ImageIcon,
  Shield,
  Lock,
  CheckCircle,
  MapPin,
  FileText,
  Sparkles,
  RotateCcw,
  Loader2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCameraCapture } from "@/hooks/useCameraCapture";

const carSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .number()
    .min(1990, "Year must be 1990 or later")
    .max(new Date().getFullYear() + 1),
  mileage: z.number().min(0, "Mileage is required and must be positive"),
  color: z.string().min(1, "Color is required"),
  location: z.string().min(1, "Location is required"),
  license_plate: z.string().min(1, "License plate is required"),
  vin_number: z.string().min(1, "VIN number is required"),
  description: z.string().optional(),
});

type CarFormData = z.infer<typeof carSchema>;

export default function AddCar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [mounted, setMounted] = useState(false);
  const {
    takePhoto,
    selectFromGallery,
    showActionSheet,
    convertPhotoToFile,
    isCapturing,
    isNative,
  } = useCameraCapture();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const fadeIn = (idx: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(12px)",
    transition: `all 500ms cubic-bezier(0.23,1,0.32,1) ${idx * 80}ms`,
  });

  const form = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      mileage: 0,
      color: "",
      location: "",
      license_plate: "",
      vin_number: "",
      description: "",
    },
  });

  const MAX_IMAGES = 5;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > MAX_IMAGES) {
      toast({
        title: "Too many images",
        description: `You can upload a maximum of ${MAX_IMAGES} images per car.`,
        variant: "destructive",
      });
      return;
    }
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCameraCapture = async () => {
    const photo = await showActionSheet({ quality: 90, allowEditing: true });
    if (photo) {
      const file = await convertPhotoToFile(photo, `car-photo-${Date.now()}.jpg`);
      if (!file) return;
      if (selectedImages.length >= MAX_IMAGES) {
        toast({
          title: "Too many images",
          description: `You can upload a maximum of ${MAX_IMAGES} images per car.`,
          variant: "destructive",
        });
        return;
      }
      setSelectedImages((prev) => [...prev, file]);
    }
  };

  const handleGallerySelect = async () => {
    const photo = await selectFromGallery({ quality: 90, allowEditing: true });
    if (photo) {
      const file = await convertPhotoToFile(photo, `car-photo-${Date.now()}.jpg`);
      if (!file) return;
      if (selectedImages.length >= MAX_IMAGES) {
        toast({
          title: "Too many images",
          description: `You can upload a maximum of ${MAX_IMAGES} images per car.`,
          variant: "destructive",
        });
        return;
      }
      setSelectedImages((prev) => [...prev, file]);
    }
  };

  const uploadImages = async (carId: string): Promise<string[]> => {
    const imageUrls: string[] = [];
    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      const fileName = `${carId}/${Date.now()}-${i}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("car-images").upload(fileName, file);
      if (error) {
        console.error("Error uploading image:", error);
        continue;
      }
      const { data } = supabase.storage.from("car-images").getPublicUrl(fileName);
      imageUrls.push(data.publicUrl);
    }
    return imageUrls;
  };

  const onSubmit = async (data: CarFormData) => {
    if (!user) return;
    if (selectedImages.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one image of your car.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: carData, error: carError } = await (supabase as any)
        .from("cars")
        .insert({
          client_id: user.id,
          make: data.make,
          model: data.model,
          year: data.year,
          mileage: data.mileage,
          color: data.color,
          location: data.location,
          license_plate: data.license_plate,
          vin_number: data.vin_number,
          description: data.description,
          status: "available",
        })
        .select()
        .single();
      if (carError) throw carError;

      if (selectedImages.length > 0) {
        const imageUrls = await uploadImages(carData.id);
        const { error: updateError } = await (supabase as any)
          .from("cars")
          .update({ images: imageUrls })
          .eq("id", carData?.id);
        if (updateError) throw updateError;
      }

      toast({
        title: "Car added successfully!",
        description: "Your car has been listed. You can now request hosting services from your My Cars page.",
      });
      navigate("/my-cars");
    } catch (error) {
      console.error("Error adding car:", error);
      toast({
        title: "Error adding car",
        description: "There was an error adding your car. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { label: "Vehicle Info", icon: Car },
    { label: "Identification", icon: Shield },
    { label: "Photos", icon: ImageIcon },
    { label: "Details", icon: FileText },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto pb-24 px-4 space-y-5">
        {/* Trust Banner */}
        <div
          style={fadeIn(0)}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-5 text-primary-foreground"
        >
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/5 blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur-sm">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Add Your Car</h1>
                <p className="text-sm text-primary-foreground/70">
                  List your vehicle for professional hosting
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  form.reset();
                  setSelectedImages([]);
                }}
                className="ml-auto h-9 w-9 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                aria-label="Reset form"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {[
                { icon: Shield, label: "Verified Listing" },
                { icon: Lock, label: "Secure Upload" },
                { icon: CheckCircle, label: "Host Protected" },
              ].map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm"
                >
                  <b.icon className="h-3 w-3" />
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div style={fadeIn(1)} className="flex items-center justify-between gap-1 px-1">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1.5 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-3 w-3" />
                </div>
                <span className="hidden sm:inline font-medium">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-border mx-1" />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Section 1: Vehicle Details */}
            <div
              style={fadeIn(2)}
              className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <Car className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">Vehicle Details</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make *</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model *</FormLabel>
                      <FormControl>
                        <Input placeholder="Camry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          {...field}
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" || isNaN(Number(val)) ? 0 : Number(val));
                          }}
                          onBlur={(e) => {
                            if (e.target.value === "") field.onChange(0);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="50000"
                          {...field}
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" || isNaN(Number(val)) ? 0 : Number(val));
                          }}
                          onBlur={(e) => {
                            if (e.target.value === "") field.onChange(0);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 2: Identification */}
            <div
              style={fadeIn(3)}
              className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">Identification</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["white", "black", "silver", "gray", "red", "blue", "green", "yellow", "other"].map((c) => (
                            <SelectItem key={c} value={c}>
                              {c[0].toUpperCase() + c.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="license_plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate *</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" autoCapitalize="characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vin_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="1HGBH41JXMN109186" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 3: Photos */}
            <div
              style={fadeIn(4)}
              className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <ImageIcon className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">Car Photos</h2>
                </div>
                <span className="text-xs font-medium text-muted-foreground rounded-full bg-muted px-2.5 py-0.5">
                  {selectedImages.length}/{MAX_IMAGES}
                </span>
              </div>

              <p className="text-xs text-muted-foreground -mt-2">
                Upload clear photos of your car (min 1, max {MAX_IMAGES}).
              </p>

              {isNative && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCameraCapture}
                    disabled={isCapturing || selectedImages.length >= MAX_IMAGES}
                    className="h-20 flex flex-col gap-2 rounded-xl border-dashed"
                  >
                    <Camera className="h-6 w-6 text-primary" />
                    <span className="text-sm">Take Photo</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGallerySelect}
                    disabled={isCapturing || selectedImages.length >= MAX_IMAGES}
                    className="h-20 flex flex-col gap-2 rounded-xl border-dashed"
                  >
                    <ImageIcon className="h-6 w-6 text-primary" />
                    <span className="text-sm">From Gallery</span>
                  </Button>
                </div>
              )}

              <div className="relative rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-8 hover:border-primary/40 transition-colors">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-primary hover:text-primary/80">
                        Click to upload images
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, JPEG up to 10MB each
                    </p>
                  </div>
                </div>
              </div>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Car photo preview ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                        className="absolute -top-1 -right-1 inline-flex items-center justify-center h-6 w-6 rounded-full bg-destructive text-destructive-foreground shadow-md ring-2 ring-background transition hover:scale-110 active:scale-95"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Description */}
            <div
              style={fadeIn(5)}
              className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">Additional Details</h2>
                <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional details about your car — modifications, special instructions, etc."
                        className="min-h-[100px] rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Trust Footer */}
            <div
              style={fadeIn(6)}
              className="flex flex-wrap items-center justify-center gap-4 py-2 text-xs text-muted-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                Your data is encrypted
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-3 w-3" />
                Verified by Teslys
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Instant listing
              </span>
            </div>

            {/* Actions */}
            <div style={fadeIn(7)} className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="flex-1 rounded-xl h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl h-12 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Car…
                  </>
                ) : (
                  "Add Car"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
