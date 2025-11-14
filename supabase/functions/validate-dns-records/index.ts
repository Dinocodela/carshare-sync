import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify super admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("user_id", user.id)
      .single();

    if (!profile?.is_super_admin) {
      throw new Error("Unauthorized: Super admin access required");
    }

    const domain = "teslys.app";
    const results: any[] = [];

    // Check SPF record
    try {
      const spfResult = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);
      const spfData = await spfResult.json();
      
      let spfValid = false;
      let spfValue = null;
      
      if (spfData.Answer) {
        const spfRecord = spfData.Answer.find((ans: any) => 
          ans.data?.includes("v=spf1")
        );
        
        if (spfRecord) {
          spfValue = spfRecord.data.replace(/"/g, '');
          spfValid = spfValue.includes("_spf.resend.com");
        }
      }

      await supabase
        .from("dns_records_validation")
        .update({
          status: spfValid ? "valid" : "invalid",
          actual_value: spfValue,
          error_message: spfValid ? null : "SPF record not found or incorrect",
          last_checked_at: new Date().toISOString()
        })
        .eq("domain", domain)
        .eq("record_type", "SPF");

      results.push({ type: "SPF", valid: spfValid });
    } catch (error) {
      console.error("SPF check error:", error);
    }

    // Check DKIM record
    try {
      const dkimSelector = "resend";
      const dkimDomain = `${dkimSelector}._domainkey.${domain}`;
      const dkimResult = await fetch(`https://dns.google/resolve?name=${dkimDomain}&type=TXT`);
      const dkimData = await dkimResult.json();
      
      let dkimValid = false;
      let dkimValue = null;
      
      if (dkimData.Answer && dkimData.Answer.length > 0) {
        dkimValue = dkimData.Answer[0].data.replace(/"/g, '');
        dkimValid = dkimValue.includes("v=DKIM1");
      }

      await supabase
        .from("dns_records_validation")
        .update({
          status: dkimValid ? "valid" : "invalid",
          actual_value: dkimValue,
          error_message: dkimValid ? null : "DKIM record not found",
          last_checked_at: new Date().toISOString()
        })
        .eq("domain", domain)
        .eq("record_type", "DKIM");

      results.push({ type: "DKIM", valid: dkimValid });
    } catch (error) {
      console.error("DKIM check error:", error);
    }

    // Check DMARC record
    try {
      const dmarcDomain = `_dmarc.${domain}`;
      const dmarcResult = await fetch(`https://dns.google/resolve?name=${dmarcDomain}&type=TXT`);
      const dmarcData = await dmarcResult.json();
      
      let dmarcValid = false;
      let dmarcValue = null;
      
      if (dmarcData.Answer && dmarcData.Answer.length > 0) {
        dmarcValue = dmarcData.Answer[0].data.replace(/"/g, '');
        dmarcValid = dmarcValue.includes("v=DMARC1");
      }

      await supabase
        .from("dns_records_validation")
        .update({
          status: dmarcValid ? "valid" : "warning",
          actual_value: dmarcValue,
          error_message: dmarcValid ? null : "DMARC record recommended for best practices",
          last_checked_at: new Date().toISOString()
        })
        .eq("domain", domain)
        .eq("record_type", "DMARC");

      results.push({ type: "DMARC", valid: dmarcValid });
    } catch (error) {
      console.error("DMARC check error:", error);
    }

    // Check MX records
    try {
      const mxResult = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
      const mxData = await mxResult.json();
      
      const mxValid = mxData.Answer && mxData.Answer.length > 0;
      const mxValue = mxData.Answer?.map((ans: any) => ans.data).join(", ");

      await supabase
        .from("dns_records_validation")
        .update({
          status: mxValid ? "valid" : "invalid",
          actual_value: mxValue,
          error_message: mxValid ? null : "No MX records found",
          last_checked_at: new Date().toISOString()
        })
        .eq("domain", domain)
        .eq("record_type", "MX");

      results.push({ type: "MX", valid: mxValid });
    } catch (error) {
      console.error("MX check error:", error);
    }

    // Generate recommendations based on DNS validation
    const invalidRecords = results.filter(r => !r.valid);
    
    if (invalidRecords.length > 0) {
      for (const record of invalidRecords) {
        await supabase
          .from("deliverability_recommendations")
          .upsert({
            title: `${record.type} Record Not Configured`,
            description: `Your ${record.type} record is missing or incorrectly configured. This can significantly impact email deliverability and cause emails to be marked as spam.`,
            severity: record.type === "SPF" || record.type === "DKIM" ? "critical" : "warning",
            category: "dns",
            is_resolved: false
          }, {
            onConflict: "title"
          });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error validating DNS records:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
