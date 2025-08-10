import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CommissionPaidRequest {
  earningId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { earningId }: CommissionPaidRequest = await req.json();

    if (!earningId) {
      return new Response(
        JSON.stringify({ error: "earningId is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Preparing commission paid email for earning:", earningId);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1) Fetch earning details
    const { data: earning, error: earningError } = await supabaseAdmin
      .from('host_earnings')
      .select(`
        id,
        car_id,
        host_id,
        client_profit_amount,
        payment_source,
        trip_id,
        guest_name,
        earning_period_start,
        earning_period_end,
        date_paid
      `)
      .eq('id', earningId)
      .maybeSingle();

    if (earningError || !earning) {
      console.error('Error fetching earning:', earningError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch earning' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2) Fetch car + client
    const { data: car, error: carError } = await supabaseAdmin
      .from('cars')
      .select('id, make, model, year, license_plate, vin_number, client_id')
      .eq('id', earning.car_id)
      .maybeSingle();

    if (carError || !car) {
      console.error('Error fetching car:', carError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch car' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3) Fetch client email from auth
    const { data: clientUser, error: clientUserError } = await supabaseAdmin.auth.admin.getUserById(car.client_id);
    if (clientUserError || !clientUser.user?.email) {
      console.error('Error fetching client user:', clientUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch client email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientEmail = clientUser.user.email;

    // 4) Fetch host profile (optional, for nicer email)
    const { data: hostProfile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, company_name')
      .eq('user_id', earning.host_id)
      .maybeSingle();

    const hostName = hostProfile ? `${hostProfile.first_name ?? ''} ${hostProfile.last_name ?? ''}`.trim() : 'Your Host';
    const hostCompany = hostProfile?.company_name ?? 'TESLYS Partner';

    const amount = Number(earning.client_profit_amount ?? 0).toFixed(2);
    const periodStart = new Date(earning.earning_period_start).toLocaleString('en-US');
    const periodEnd = new Date(earning.earning_period_end).toLocaleString('en-US');
    const paidDate = earning.date_paid ? new Date(earning.date_paid).toLocaleDateString('en-US') : 'Today';

    const carDetails = `${car.year ?? ''} ${car.make ?? ''} ${car.model ?? ''}`.trim();
    const carIdents = [car.license_plate ? `Plate: ${car.license_plate}` : null, car.vin_number ? `VIN: ${car.vin_number.slice(-6)}` : null].filter(Boolean).join(' • ');

    const subject = `Commission Payment Completed${earning.trip_id ? ` - Trip #${earning.trip_id}` : ''}`;

    const emailResponse = await resend.emails.send({
      from: "TESLYS Platform <support@dinocodela.com>",
      to: [clientEmail],
      subject,
      html: `
        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
          <h1 style=\"color: #059669; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px;\">Commission Payment Completed</h1>

          <p>Hi there,</p>
          <p>We're happy to let you know that your commission payment has been <strong>completed</strong>.</p>

          <div style=\"background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;\">
            <h3 style=\"margin-top: 0; color: #374151;\">Payment Summary</h3>
            <p style=\"margin: 8px 0;\"><strong>Amount Paid:</strong> $${amount}</p>
            <p style=\"margin: 8px 0;\"><strong>Payment Source:</strong> ${earning.payment_source || 'N/A'}</p>
            <p style=\"margin: 8px 0;\"><strong>Date Paid:</strong> ${paidDate}</p>
            ${earning.trip_id ? `<p style=\"margin: 8px 0;\"><strong>Trip #:</strong> ${earning.trip_id}</p>` : ''}
            ${earning.guest_name ? `<p style=\"margin: 8px 0;\"><strong>Guest:</strong> ${earning.guest_name}</p>` : ''}
          </div>

          <div style=\"background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; margin: 20px 0;\">
            <h3 style=\"margin-top: 0; color: #059669;\">Rental Details</h3>
            <p style=\"margin: 8px 0;\"><strong>Vehicle:</strong> ${carDetails}</p>
            ${carIdents ? `<p style=\"margin: 8px 0;\"><strong>${carIdents}</strong></p>` : ''}
            <p style=\"margin: 8px 0;\"><strong>Period:</strong> ${periodStart} – ${periodEnd}</p>
          </div>

          <p>If you have any questions, feel free to reach out to your host or our support team.</p>

          <div style=\"text-align: center; margin: 30px 0;\">
            <a href=\"${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://yourapp.com'}/client-analytics\" 
               style=\"display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;\">
              View My Earnings
            </a>
          </div>

          <hr style=\"border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;\">
          <p style=\"color: #6b7280; font-size: 14px;\">Best regards,<br>The TESLYS Platform Team</p>
          <p style=\"color: #9ca3af; font-size: 12px; margin-top: 30px;\">This is an automated notification. Please do not reply to this email.</p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Resend error in send-client-commission-paid:", emailResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Commission paid email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-client-commission-paid function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
