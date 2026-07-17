import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims } = await supabase.auth.getClaims(token);
    if (!claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const blockId = typeof body?.block_id === 'string' ? body.block_id : null;
    const removed = body?.removed === true;
    if (!blockId) {
      return new Response(JSON.stringify({ error: 'block_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: block, error: bErr } = await admin
      .from('car_blocks')
      .select('id, car_id, created_by, start_at, end_at, notes')
      .eq('id', blockId)
      .maybeSingle();

    if (bErr || !block) {
      return new Response(JSON.stringify({ error: 'Block not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: car } = await admin
      .from('cars')
      .select('make, model, year, license_plate, nickname, host_id, client_id')
      .eq('id', block.car_id)
      .maybeSingle();

    const { data: profile } = await admin
      .from('profiles')
      .select('first_name, last_name, email, role')
      .eq('user_id', block.created_by)
      .maybeSingle();

    const webhook = Deno.env.get('SLACK_WEBHOOK_URL');
    if (!webhook) {
      console.warn('SLACK_WEBHOOK_URL not set; skipping Slack post');
      return new Response(JSON.stringify({ ok: true, skipped: 'no_webhook' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const carName =
      (car?.nickname || '').trim() ||
      `${car?.make ?? ''} ${car?.model ?? ''}`.trim() ||
      'Unknown car';
    const plate = car?.license_plate?.toUpperCase() || 'N/A';
    const who =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() ||
      profile?.email ||
      'Unknown user';
    const role = profile?.role || 'user';

    const fmt = (iso: string) =>
      new Date(iso).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Los_Angeles',
      });

    const text =
      `🔒 *Car blocked* — ${carName} · plate *${plate}*\n` +
      `${fmt(block.start_at)}  →  ${fmt(block.end_at)}\n` +
      `By ${who} (${role})\n` +
      `Notes: ${block.notes ? block.notes : '—'}`;

    try {
      const slackRes = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const slackBody = await slackRes.text();
      console.log('Slack response:', slackRes.status, slackBody);
      if (!slackRes.ok) {
        return new Response(
          JSON.stringify({ ok: false, slack_status: slackRes.status, slack_body: slackBody }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    } catch (e) {
      console.warn('Slack webhook post failed:', e);
    }

    // Best-effort: touch userId to keep unused-var linter happy
    void userId;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('notify-car-block error', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
