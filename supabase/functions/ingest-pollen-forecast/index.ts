// supabase/functions/ingest-pollen-forecast/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// استخدمي Service Role Key (ليس anon)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// حماية اختيارية بهيدر Authorization
const INGEST_SECRET = Deno.env.get("INGEST_SECRET_KEY") || "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface RowV1 {
  time: string;             // "YYYY-MM-DD"
  index_0_100: number;
  severity: string;         // "Low|Medium|High|Very High"
}

interface RecordDirect {
  date: string;
  lat: number;
  lon: number;
  score: number;
  severity: string;
  unit?: string;
  generated_at?: string;
  details?: Record<string, unknown> | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // حماية اختيارية
    if (INGEST_SECRET) {
      const auth = req.headers.get("authorization") || "";
      if (auth !== `Bearer ${INGEST_SECRET}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();

    // نقبل شكلين:
    // 1) Array<RecordDirect>
    // 2) { lat, lon, unit?, generated_at?, rows: RowV1[] }
    let records: RecordDirect[] = [];

    if (Array.isArray(body)) {
      // شكل مباشر
      records = body;
    } else if (body?.rows && Array.isArray(body.rows)) {
      // شكل forecast.json
      const lat = body.lat ?? 32.556;
      const lon = body.lon ?? 35.85;
      const unit = body.unit ?? "index_0_100";
      const generated_at = body.generated_at ?? new Date().toISOString();

      records = (body.rows as RowV1[]).map((r) => ({
        date: r.time,
        lat,
        lon,
        score: Number(r.index_0_100),
        severity: String(r.severity),
        unit,
        generated_at,
        details: null,
      }));
    } else {
      return new Response(JSON.stringify({ error: "Invalid payload format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // تحقّق الحقول
    for (const r of records) {
      if (
        !r.date ||
        typeof r.lat !== "number" ||
        typeof r.lon !== "number" ||
        typeof r.score !== "number" ||
        !r.severity
      ) {
        return new Response(
          JSON.stringify({
            error: "Missing required fields: date, lat, lon, score, severity",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // upsert حسب (date,lat,lon)
    const { data, error } = await supabase
      .from("pollen_forecast")
      .upsert(
        records.map((r) => ({
          date: r.date,
          lat: Number(r.lat.toFixed?.(4) ?? r.lat),
          lon: Number(r.lon.toFixed?.(4) ?? r.lon),
          score: r.score,
          severity: r.severity,
          unit: r.unit ?? "index_0_100",
          generated_at: r.generated_at ?? new Date().toISOString(),
          details: r.details ?? null,
        })),
        { onConflict: "date,lat,lon" }
      )
      .select();

    if (error) {
      console.error("DB error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully ingested ${data?.length ?? 0} forecast(s)`,
        data,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Function error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});