import { useState } from "react";
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
  Info,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const {
    takePhoto,
    selectFromGallery,
    showActionSheet,
    convertPhotoToFile,
    isCapturing,
    isNative,
  } = useCameraCapture();

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
      const file = await convertPhotoToFile(
        photo,
        `car-photo-${Date.now()}.jpg`
      );
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
      const file = await convertPhotoToFile(
        photo,
        `car-photo-${Date.now()}.jpg`
      );
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
      const fileName = `${carId}/${Date.now()}-${i}.${file.name
        .split(".")
        .pop()}`;
      const { error } = await supabase.storage
        .from("car-images")
        .upload(fileName, file);
      if (error) {
        console.error("Error uploading image:", error);
        continue;
      }
      const { data } = supabase.storage
        .from("car-images")
        .getPublicUrl(fileName);
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
        description:
          "Your car has been listed. You can now request hosting services from your My Cars page.",
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

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto pb-24 px-4">
        {/* Header */}
        <section className="mb-6">
          {/* Desktop / tablet (md+): full header with info + reset */}
          <div className="hidden md:flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Car className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">Add Your Car</h1>
              </div>
              <p className="text-muted-foreground">
                Fill out the details below to list your car for hosting
                services.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                form.reset();
                setSelectedImages([]);
              }}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Mobile (sm and below): compact banner */}
          <div className="md:hidden">
            <div className="rounded-2xl border bg-muted/40 p-3 flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Add your car details to request hosting services.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  form.reset();
                  setSelectedImages([]);
                }}
                className="h-9 w-9 shrink-0"
                aria-label="Reset form"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-2 mt-2 text-[12px] text-muted-foreground border-b pb-4">
              <div className="rounded-md bg-primary/10 p-1">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <span>
                Provide accurate information about your vehicle to help hosts
                understand your needs.
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Rows are responsive now */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            value={field.value === 0 ? "" : field.value} // show empty if value is 0
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || isNaN(Number(val))) {
                                field.onChange(0); // invalid -> 0
                              } else {
                                field.onChange(Number(val));
                              }
                            }}
                            onBlur={(e) => {
                              // if empty on blur, reset to 0
                              if (e.target.value === "") {
                                field.onChange(0);
                              }
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
                            value={field.value === 0 ? "" : field.value} // show empty if value is 0
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || isNaN(Number(val))) {
                                field.onChange(0); // invalid -> 0
                              } else {
                                field.onChange(Number(val));
                              }
                            }}
                            onBlur={(e) => {
                              // if empty on blur, reset to 0
                              if (e.target.value === "") {
                                field.onChange(0);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              "white",
                              "black",
                              "silver",
                              "gray",
                              "red",
                              "blue",
                              "green",
                              "yellow",
                              "other",
                            ].map((c) => (
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="license_plate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ABC-1234"
                            autoCapitalize="characters"
                            {...field}
                          />
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional details about your car..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Images */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Car Images *
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Upload photos of your car (min 1, max {MAX_IMAGES}).
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {selectedImages.length}/{MAX_IMAGES}
                    </span>
                  </div>

                  {isNative && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCameraCapture}
                        disabled={
                          isCapturing || selectedImages.length >= MAX_IMAGES
                        }
                        className="h-20 flex flex-col gap-2"
                      >
                        <Camera className="h-6 w-6" />
                        <span className="text-sm">Take Photo</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGallerySelect}
                        disabled={
                          isCapturing || selectedImages.length >= MAX_IMAGES
                        }
                        className="h-20 flex flex-col gap-2"
                      >
                        <ImageIcon className="h-6 w-6" />
                        <span className="text-sm">From Gallery</span>
                      </Button>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-border rounded-xl p-6">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
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
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {selectedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Tesla car photo preview ${index + 1} - Upload preview for vehicle listing`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            aria-label={`Remove image ${index + 1}`}
                            className="
                              absolute -top-2 -right-2
                              inline-flex items-center justify-center
                              h-7 w-7 rounded-full
                              bg-red-500 text-white shadow-md
                              ring-2 ring-white
                              transition hover:scale-105 active:scale-95
                            "
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Adding Car..." : "Add Car"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
