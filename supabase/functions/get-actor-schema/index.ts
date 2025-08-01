import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`🚀 get-actor-schema function called: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('📥 Request body received:', { 
      hasToken: !!body?.token, 
      actorId: body?.actorId 
    });

    const { actorId } = body;

    if (!actorId) {
      console.error('❌ Missing actorId in request');
      return new Response(
        JSON.stringify({ error: 'ActorId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use backend APIFY_API_TOKEN instead of frontend token
    const backendToken = Deno.env.get('APIFY_API_TOKEN');
    
    if (!backendToken) {
      console.error('❌ Backend APIFY_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Backend API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Using backend token for actor schema: ${actorId}`);

    console.log('📡 Fetching actor versions from Apify API...');
    
    const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/versions`, {
      headers: {
        'Authorization': `Bearer ${backendToken}`,
      },
    });

    console.log(`📡 Apify API response status: ${response.status}`);
    
    const data = await response.json();
    console.log(`📋 API response data:`, { 
      success: response.ok, 
      versionsCount: data?.data?.items?.length || 0,
      hasError: !!data.error 
    });

    if (!response.ok) {
      console.error('❌ Apify API error:', {
        status: response.status,
        error: data.error?.message || 'Unknown error',
        actorId
      });
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Failed to fetch actor schema' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the latest version
    const latestVersion = data.data.items[0];
    const inputSchema = latestVersion?.inputSchema || {};

    console.log('✅ Successfully fetched schema:', {
      actorId,
      version: latestVersion?.versionNumber || '0.0',
      hasProperties: !!inputSchema.properties,
      propertyCount: inputSchema.properties ? Object.keys(inputSchema.properties).length : 0
    });

    return new Response(
      JSON.stringify({ 
        schema: inputSchema,
        version: latestVersion?.versionNumber || '0.0'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Unexpected error in get-actor-schema:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error while fetching actor schema',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});