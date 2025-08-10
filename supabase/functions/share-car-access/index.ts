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

    // Extract and validate Authorization header
    const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization') ?? '';
    if (!/^Bearer\s+/i.test(authHeader)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const jwt = authHeader.replace(/^Bearer\s+/i, '');

    // Client for verifying the caller (uses the JWT from the request)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: authData, error: authError } = await supabase.auth.getUser(jwt);
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

    // Find target user by email using Admin API (list + filter)
    const { data: usersList, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listUsersError) {
      console.error('Error listing users:', listUsersError);
      return new Response(JSON.stringify({ error: 'Failed to lookup user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const target = usersList?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (!target) {
      return new Response(JSON.stringify({ error: 'No user found with that email' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const targetUserId = target.id;

    console.log('Granting access', { carId, targetUserId, permission, granted_by: callerId });

    // Check if access already exists
    const { data: existingAccess, error: selectError } = await supabaseAdmin
      .from('car_access')
      .select('id, car_id, user_id, permission')
      .eq('car_id', carId)
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing car_access:', selectError);
      return new Response(JSON.stringify({ error: 'Failed to check existing access' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let accessRow;

    if (existingAccess) {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('car_access')
        .update({ permission, granted_by: callerId, updated_at: new Date().toISOString() })
        .eq('id', existingAccess.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Error updating car_access:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update access' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      accessRow = updated;
    } else {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('car_access')
        .insert({ car_id: carId, user_id: targetUserId, permission, granted_by: callerId })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Error inserting car_access:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to grant access' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      accessRow = inserted;
    }

    return new Response(JSON.stringify({ success: true, access: accessRow }), {
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