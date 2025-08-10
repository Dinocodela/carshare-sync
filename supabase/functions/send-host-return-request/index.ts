import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReturnRequestNotification {
  carId: string;
  hostUserId: string;
  clientId: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { carId, hostUserId, clientId, message }: ReturnRequestNotification = await req.json();

    console.log("Sending return request notification for car:", carId);

    // Initialize Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get host and client details
    const [hostResponse, clientResponse, carResponse] = await Promise.all([
      supabase.auth.admin.getUserById(hostUserId),
      supabase.auth.admin.getUserById(clientId),
      supabase
        .from('cars')
        .select('make, model, year')
        .eq('id', carId)
        .single()
    ]);

    if (hostResponse.error || !hostResponse.data.user?.email) {
      throw new Error('Host not found or missing email');
    }

    if (clientResponse.error || !clientResponse.data.user) {
      throw new Error('Client not found');
    }

    if (carResponse.error || !carResponse.data) {
      throw new Error('Car not found');
    }

    const hostEmail = hostResponse.data.user.email;
    const hostName = hostResponse.data.user.user_metadata?.first_name || 'Host';
    const clientName = `${clientResponse.data.user.user_metadata?.first_name || ''} ${clientResponse.data.user.user_metadata?.last_name || ''}`.trim() || 'Client';
    const clientPhone = clientResponse.data.user.user_metadata?.phone;
    const clientEmail = clientResponse.data.user.email;
    const carDetails = `${carResponse.data.year} ${carResponse.data.make} ${carResponse.data.model}`;

    const emailResponse = await resend.emails.send({
      from: "TESLYS Platform <support@dinocodela.com>",
      to: [hostEmail],
      subject: "Car Return Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px;">
            Car Return Request
          </h1>
          
          <p>Hi ${hostName},</p>
          
          <p><strong>${clientName}</strong> has requested to return the car they're currently hosting.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Client Contact Information:</h3>
            <div style="color: #374151; line-height: 1.6;">
              <p style="margin: 8px 0;"><strong>Client:</strong> ${clientName}</p>
              ${clientPhone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${clientPhone}" style="color: #2563eb;">${clientPhone}</a></p>` : ''}
              ${clientEmail ? `<p style=\"margin: 8px 0;\"><strong>Email:</strong> <a href=\"mailto:${clientEmail}\" style=\"color: #2563eb;\">${clientEmail}</a></p>` : ''}
            </div>
            
            <h3 style="margin-top: 20px; color: #374151;">Car Details:</h3>
            <p style="margin: 8px 0;"><strong>Vehicle:</strong> ${carDetails}</p>
            
            ${message ? `
            <h3 style="color: #374151;">Client Message:</h3>
            <p style="background-color: white; padding: 16px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 0;">
              ${message}
            </p>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>Please coordinate with the client to arrange the car return.</p>
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://yourapp.com'}/dashboard" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Dashboard
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
      console.error("Resend error in send-host-return-request:", emailResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Return request notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-host-return-request function:", error);
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