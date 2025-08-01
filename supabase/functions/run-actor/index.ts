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
    const { token, actorId, input, mode = 'OUTPUT' } = await req.json();

    if (!token || !actorId) {
      return new Response(
        JSON.stringify({ error: 'Token and actorId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start the actor run
    const runResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?waitForFinish=60`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input || {}),
    });

    const runData = await runResponse.json();

    if (!runResponse.ok) {
      return new Response(
        JSON.stringify({ error: runData.error?.message || 'Failed to run actor' }),
        { status: runResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const run = runData.data;

    // If run finished, get the results
    if (run.status === 'SUCCEEDED') {
      let resultData = null;

      if (mode === 'DATASET' && run.defaultDatasetId) {
        // Get dataset items
        const datasetResponse = await fetch(
          `https://api.apify.com/v2/datasets/${run.defaultDatasetId}/items?clean=true&format=json`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        if (datasetResponse.ok) {
          resultData = await datasetResponse.json();
        }
      } else if (run.defaultKeyValueStoreId) {
        // Get OUTPUT record
        const outputResponse = await fetch(
          `https://api.apify.com/v2/key-value-stores/${run.defaultKeyValueStoreId}/records/OUTPUT`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        if (outputResponse.ok) {
          const contentType = outputResponse.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            resultData = await outputResponse.json();
          } else {
            resultData = await outputResponse.text();
          }
        }
      }

      return new Response(
        JSON.stringify({
          run: {
            id: run.id,
            status: run.status,
            startedAt: run.startedAt,
            finishedAt: run.finishedAt,
            stats: run.stats
          },
          result: resultData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (run.status === 'FAILED') {
      return new Response(
        JSON.stringify({
          run: {
            id: run.id,
            status: run.status,
            startedAt: run.startedAt,
            finishedAt: run.finishedAt
          },
          error: 'Actor run failed'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Run is still running or timed out
      return new Response(
        JSON.stringify({
          run: {
            id: run.id,
            status: run.status,
            startedAt: run.startedAt
          },
          message: 'Actor is still running. Check status manually or increase timeout.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('❌ Unexpected error in run-actor:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error while running actor',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});