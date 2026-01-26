import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const contentType = req.headers.get("content-type") || "";
    
    let make: string | null = null;
    let model: string | null = null;
    let year: number | null = null;
    let color: string | null = null;
    let mileage: number | null = null;
    let location: string | null = null;
    let description: string | null = null;
    let licensePlate: string | null = null;
    let vinNumber: string | null = null;
    const imageUrls: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form data with image uploads
      const formData = await req.formData();
      
      make = formData.get("make") as string;
      model = formData.get("model") as string;
      const yearStr = formData.get("year") as string;
      year = yearStr ? parseInt(yearStr, 10) : null;
      color = formData.get("color") as string | null;
      const mileageStr = formData.get("mileage") as string;
      mileage = mileageStr ? parseInt(mileageStr, 10) : null;
      location = formData.get("location") as string | null;
      description = formData.get("description") as string | null;
      licensePlate = formData.get("license_plate") as string | null;
      vinNumber = formData.get("vin_number") as string | null;

      // Process uploaded images
      const entries = formData.entries();
      for (const [key, value] of entries) {
        if (key === "images" && value instanceof File) {
          const file = value as File;
          if (file.size > 0) {
            // Generate unique filename
            const ext = file.name.split('.').pop() || 'jpg';
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            
            // Upload to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("car-images")
              .upload(fileName, file, {
                contentType: file.type,
                upsert: false,
              });

            if (uploadError) {
              console.error("Upload error:", uploadError.message);
              continue;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
              .from("car-images")
              .getPublicUrl(fileName);
            
            if (urlData?.publicUrl) {
              imageUrls.push(urlData.publicUrl);
              console.log("Uploaded image:", urlData.publicUrl);
            }
          }
        }
      }
    } else {
      // Handle JSON body (with image URLs instead of uploads)
      const payload = await req.json();
      make = payload.make;
      model = payload.model;
      year = payload.year;
      color = payload.color;
      mileage = payload.mileage;
      location = payload.location;
      description = payload.description;
      licensePlate = payload.license_plate;
      vinNumber = payload.vin_number;
      
      if (payload.images && Array.isArray(payload.images)) {
        imageUrls.push(...payload.images);
      }
    }

    // Validate required fields
    if (!make || typeof make !== 'string') {
      return new Response(
        JSON.stringify({ error: "make is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!model || typeof model !== 'string') {
      return new Response(
        JSON.stringify({ error: "model is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!year || typeof year !== 'number' || isNaN(year)) {
      return new Response(
        JSON.stringify({ error: "year is required and must be a number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare car data
    const carData = {
      client_id: user.id,
      make: make.trim(),
      model: model.trim(),
      year: year,
      color: color?.trim() || null,
      mileage: mileage || null,
      location: location?.trim() || null,
      description: description?.trim() || null,
      images: imageUrls.length > 0 ? imageUrls : null,
      license_plate: licensePlate?.trim() || null,
      vin_number: vinNumber?.trim() || null,
      status: 'available',
    };

    console.log("Inserting car data:", JSON.stringify(carData));

    // Insert the car
    const { data, error } = await supabase
      .from("cars")
      .insert(carData)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Created car:", data?.id);

    return new Response(
      JSON.stringify({ success: true, car: data }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
