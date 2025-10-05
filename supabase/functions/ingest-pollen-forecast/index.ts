import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PollenForecastData {
  date: string;
  lat: number;
  lon: number;
  score: number;
  severity: string;
  unit?: string;
  generated_at?: string;
  details?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const body = await req.json();
    console.log('Received request body:', body);

    // Support both single forecast and array of forecasts
    const forecasts: PollenForecastData[] = Array.isArray(body) ? body : [body];

    // Validate required fields
    for (const forecast of forecasts) {
      if (!forecast.date || !forecast.lat || !forecast.lon || forecast.score === undefined || !forecast.severity) {
        console.error('Missing required fields in forecast:', forecast);
        return new Response(
          JSON.stringify({ 
            error: 'Missing required fields: date, lat, lon, score, and severity are required' 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Prepare data for insertion
    const dataToInsert = forecasts.map(forecast => ({
      date: forecast.date,
      lat: forecast.lat,
      lon: forecast.lon,
      score: forecast.score,
      severity: forecast.severity,
      unit: forecast.unit || 'index_0_100',
      generated_at: forecast.generated_at || new Date().toISOString(),
      details: forecast.details || null,
    }));

    console.log('Inserting data:', dataToInsert);

    // Insert or update forecast data (upsert based on unique constraint)
    const { data, error } = await supabaseClient
      .from('pollen_forecast')
      .upsert(dataToInsert, {
        onConflict: 'date,lat,lon',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Successfully ingested pollen forecast data:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully ingested ${data.length} forecast(s)`,
        data 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in ingest-pollen-forecast function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
