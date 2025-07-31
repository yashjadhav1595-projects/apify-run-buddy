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
    const token = Deno.env.get('APIFY_API_TOKEN');
    console.log('Checking for APIFY_API_TOKEN:', token ? 'Found' : 'Not found');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Apify API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.apify.com/v2/acts?my=1&limit=100', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
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

    return new Response(
      JSON.stringify({ actors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching actors:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch actors' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});