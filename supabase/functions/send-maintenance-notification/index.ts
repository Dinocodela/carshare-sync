import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MaintenanceNotification {
  carId: string;
  maintenanceType: string;
  scheduledDate: string;
  scheduledTime?: string;
  provider: string;
  estimatedCost?: number;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { carId, maintenanceType, scheduledDate, scheduledTime, provider, estimatedCost, notes }: MaintenanceNotification = await req.json();

    console.log("Sending maintenance notification for car:", carId);

    // Initialize Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get car and client details
    const carResponse = await supabase
      .from('cars')
      .select('make, model, year, user_id')
      .eq('id', carId)
      .single();

    if (carResponse.error || !carResponse.data) {
      throw new Error('Car not found');
    }

    const clientResponse = await supabase.auth.admin.getUserById(carResponse.data.user_id);

    if (clientResponse.error || !clientResponse.data.user?.email) {
      throw new Error('Client not found or missing email');
    }

    const clientEmail = clientResponse.data.user.email;
    const clientName = `${clientResponse.data.user.user_metadata?.first_name || ''} ${clientResponse.data.user.user_metadata?.last_name || ''}`.trim() || 'Client';
    const carDetails = `${carResponse.data.year} ${carResponse.data.make} ${carResponse.data.model}`;

    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailResponse = await resend.emails.send({
      from: "TESLYS Platform <support@dinocodela.com>",
      to: [clientEmail],
      subject: `Maintenance Scheduled for Your ${carResponse.data.make} ${carResponse.data.model}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px;">
            Maintenance Scheduled
          </h1>
          
          <p>Hi ${clientName},</p>
          
          <p>We wanted to inform you that maintenance has been scheduled for your vehicle.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Vehicle Information:</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Vehicle:</strong> ${carDetails}</p>
            
            <h3 style="margin-top: 20px; color: #374151;">Maintenance Details:</h3>
            <div style="color: #374151; line-height: 1.6;">
              <p style="margin: 8px 0;"><strong>Type:</strong> ${maintenanceType}</p>
              <p style="margin: 8px 0;"><strong>Scheduled Date:</strong> ${formattedDate}</p>
              ${scheduledTime ? `<p style="margin: 8px 0;"><strong>Time:</strong> ${scheduledTime}</p>` : ''}
              <p style="margin: 8px 0;"><strong>Service Provider:</strong> ${provider}</p>
              ${estimatedCost ? `<p style="margin: 8px 0;"><strong>Estimated Cost:</strong> $${estimatedCost}</p>` : ''}
            </div>
            
            ${notes ? `
            <h3 style="color: #374151; margin-top: 20px;">Additional Notes:</h3>
            <p style="background-color: white; padding: 16px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 0;">
              ${notes}
            </p>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>You can view more details and track the maintenance progress in your dashboard.</p>
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://yourapp.com'}/my-cars" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View My Cars
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The TESLYS Platform Team
          </p>
          
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Resend error in send-maintenance-notification:", emailResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Maintenance notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-maintenance-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);