import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Car, Upload, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const carSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1990, 'Year must be 1990 or later').max(new Date().getFullYear() + 1),
  mileage: z.number().min(0, 'Mileage is required and must be positive'),
  color: z.string().min(1, 'Color is required'),
  location: z.string().min(1, 'Location is required'),
  license_plate: z.string().min(1, 'License plate is required'),
  vin_number: z.string().min(1, 'VIN number is required'),
  description: z.string().optional(),
});

type CarFormData = z.infer<typeof carSchema>;

export default function AddCar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const form = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      mileage: 0,
      color: '',
      location: '',
      license_plate: '',
      vin_number: '',
      description: '',
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images per car.",
        variant: "destructive",
      });
      return;
    }
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (carId: string): Promise<string[]> => {
    const imageUrls: string[] = [];
    
    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      const fileName = `${carId}/${Date.now()}-${i}.${file.name.split('.').pop()}`;
      
      const { error } = await supabase.storage
        .from('car-images')
        .upload(fileName, file);
      
      if (error) {
        console.error('Error uploading image:', error);
        continue;
      }
      
      const { data } = supabase.storage
        .from('car-images')
        .getPublicUrl(fileName);
      
      imageUrls.push(data.publicUrl);
    }
    
    return imageUrls;
  };

  const onSubmit = async (data: CarFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Insert car data
      const { data: carData, error: carError } = await (supabase as any)
        .from('cars')
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
          status: 'available',
        })
        .select()
        .single();

      if (carError) throw carError;

      // Upload images if any
      if (selectedImages.length > 0) {
        const imageUrls = await uploadImages(carData.id);
        
        // Update car with image URLs
        const { error: updateError } = await (supabase as any)
          .from('cars')
          .update({ images: imageUrls })
          .eq('id', carData?.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Car added successfully!",
        description: "Your car has been listed. You can now request hosting services from your My Cars page.",
      });

      navigate('/my-cars');
    } catch (error) {
      console.error('Error adding car:', error);
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Add Your Car</h1>
          </div>
          <p className="text-muted-foreground">
            Fill out the details below to list your car for hosting services.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Car Details</CardTitle>
            <CardDescription>
              Provide accurate information about your vehicle to help hosts understand your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
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
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Camry" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                            placeholder="50000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="white">White</SelectItem>
                            <SelectItem value="black">Black</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                            <SelectItem value="gray">Gray</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="yellow">Yellow</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="license_plate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate *</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-1234" {...field} />
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

                {/* Image Upload */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Car Images (Optional - Max 5)
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Upload photos of your car to help hosts better understand your vehicle.
                    </p>
                  </div>
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
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
                    <div className="grid grid-cols-3 gap-4">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Adding Car...' : 'Add Car'}
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