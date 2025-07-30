import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, actorId } = await req.json();

    if (!token || !actorId) {
      return new Response(
        JSON.stringify({ error: 'Token and actorId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/versions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Failed to fetch actor schema' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the latest version
    const latestVersion = data.data.items[0];
    const inputSchema = latestVersion?.inputSchema || {};

    return new Response(
      JSON.stringify({ 
        schema: inputSchema,
        version: latestVersion?.versionNumber || '0.0'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching actor schema:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch actor schema' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});