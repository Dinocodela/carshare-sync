import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShareRequestBody {
  carId: string;
  email: string;
  permission?: 'viewer' | 'editor';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { carId, email, permission = 'viewer' } = await req.json() as ShareRequestBody;

    if (!carId || !email) {
      return new Response(JSON.stringify({ error: 'carId and email are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['viewer','editor'].includes(permission)) {
      return new Response(JSON.stringify({ error: 'Invalid permission' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Client for verifying the caller (uses the JWT from the request)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
      }
    );

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const callerId = authData.user.id;

    // Verify caller owns the car
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id, client_id')
      .eq('id', carId)
      .maybeSingle();

    if (carError || !car) {
      return new Response(JSON.stringify({ error: 'Car not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (car.client_id !== callerId) {
      return new Response(JSON.stringify({ error: 'Only the car owner can share access' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Admin client for user lookup and upsert (bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: targetUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    if (getUserError || !targetUser?.user) {
      return new Response(JSON.stringify({ error: 'No user found with that email' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const targetUserId = targetUser.user.id;

    // Upsert car access
    const { data: upsertData, error: upsertError } = await supabaseAdmin
      .from('car_access')
      .upsert({ car_id: carId, user_id: targetUserId, permission, granted_by: callerId }, { onConflict: 'car_id,user_id' })
      .select()
      .maybeSingle();

    if (upsertError) {
      console.error('Error upserting car_access:', upsertError);
      return new Response(JSON.stringify({ error: 'Failed to grant access' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, access: upsertData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('share-car-access error:', e);
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});