import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ClientConfirmationRequest {
  requestId: string;
  clientEmail: string;
  clientName: string;
  hostName: string;
  hostCompany: string;
  carDetails: string;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, clientEmail, clientName, hostName, hostCompany, carDetails, status }: ClientConfirmationRequest = await req.json();

    console.log("Sending client confirmation email for request:", requestId);

    const isAccepted = status === 'accepted';
    const subject = isAccepted ? "Your Car Hosting Request Has Been Accepted!" : "Update on Your Car Hosting Request";
    
    const emailResponse = await resend.emails.send({
      from: "CarHost Platform <notifications@resend.dev>",
      to: [clientEmail],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: ${isAccepted ? '#059669' : '#dc2626'}; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px;">
            ${isAccepted ? '🎉 Request Accepted!' : 'Request Update'}
          </h1>
          
          <p>Hi ${clientName},</p>
          
          <p>
            ${isAccepted 
              ? `Great news! Your car hosting request has been <strong>accepted</strong> by ${hostName} from ${hostCompany}.`
              : `Your car hosting request has been updated by ${hostName} from ${hostCompany}.`
            }
          </p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Request Details:</h3>
            <p style="margin: 8px 0;"><strong>Vehicle:</strong> ${carDetails}</p>
            <p style="margin: 8px 0;"><strong>Host:</strong> ${hostName} (${hostCompany})</p>
            <p style="margin: 8px 0;"><strong>Status:</strong> 
              <span style="color: ${isAccepted ? '#059669' : '#dc2626'}; font-weight: bold; text-transform: capitalize;">
                ${status}
              </span>
            </p>
          </div>
          
          ${isAccepted ? `
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #059669;">Next Steps:</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li>Your host will contact you soon to arrange pickup details</li>
                <li>Please ensure your vehicle is clean and ready for hosting</li>
                <li>You'll receive updates on your car's hosting progress</li>
              </ul>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://yourapp.com'}/my-cars" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View My Cars
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

    console.log("Client confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-client-confirmation function:", error);
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