import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`🚀 list-actors function called: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('📥 Request body received:', { hasToken: !!body?.token });

    // Use backend APIFY_API_TOKEN instead of frontend token
    const backendToken = Deno.env.get('APIFY_API_TOKEN');
    
    if (!backendToken) {
      console.error('❌ Backend APIFY_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Backend API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Using backend APIFY_API_TOKEN for authentication');

    console.log('📡 Fetching actors from Apify API...');
    
    const response = await fetch('https://api.apify.com/v2/acts?my=1&limit=100', {
      headers: {
        'Authorization': `Bearer ${backendToken}`,
      },
    });

    console.log(`📡 Apify API response status: ${response.status}`);
    
    const data = await response.json();
    console.log(`📋 API response data:`, { 
      success: response.ok, 
      itemCount: data?.data?.items?.length || 0,
      hasError: !!data.error 
    });

    if (!response.ok) {
      console.error('❌ Apify API error:', {
        status: response.status,
        error: data.error?.message || 'Unknown error'
      });
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Failed to fetch actors' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const actors = data.data.items.map((actor: any) => ({
      id: actor.id,
      name: actor.name,
      title: actor.title,
      description: actor.description,
      username: actor.username
    }));

    console.log(`✅ Successfully processed ${actors.length} actors`);

    return new Response(
      JSON.stringify({ actors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Unexpected error in list-actors:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error while fetching actors',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});