import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface HostNotificationRequest {
  requestId: string;
  hostEmail: string;
  hostName: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  carDetails: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, hostEmail, hostName, clientName, clientPhone, clientEmail, carDetails, message }: HostNotificationRequest = await req.json();

    console.log("Sending host notification email for request:", requestId);

    const emailResponse = await resend.emails.send({
      from: "CarHost Platform <notifications@resend.dev>",
      to: [hostEmail],
      subject: "New Car Hosting Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px;">
            New Hosting Request
          </h1>
          
          <p>Hi ${hostName},</p>
          
          <p>You have received a new car hosting request from <strong>${clientName}</strong>.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Client Contact Information:</h3>
            <div style="color: #374151; line-height: 1.6;">
              <p style="margin: 8px 0;"><strong>Client:</strong> ${clientName}</p>
              ${clientPhone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${clientPhone}" style="color: #2563eb;">${clientPhone}</a></p>` : ''}
              ${clientEmail ? `<p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${clientEmail}" style="color: #2563eb;">${clientEmail}</a></p>` : ''}
            </div>
            
            <h3 style="margin-top: 20px; color: #374151;">Car Details:</h3>
            <p style="margin: 8px 0;"><strong>Vehicle:</strong> ${carDetails}</p>
            
            <h3 style="color: #374151;">Client Message:</h3>
            <p style="background-color: white; padding: 16px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 0;">
              ${message}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>Please log in to your dashboard to review and respond to this request.</p>
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://yourapp.com'}/dashboard" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review Request
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The CarHost Platform Team
          </p>
          
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log("Host notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-host-notification function:", error);
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