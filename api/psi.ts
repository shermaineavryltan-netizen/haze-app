import type { Request, Response } from 'express';

// Official Singapore Data.gov.sg real-time PSI v2 endpoint
// Note: no API key required for this public open data service
const PRIMARY_DATA_GOV_PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const FALLBACK_DATA_GOV_PSI_URL = 'https://api.data.gov.sg/v1/environment/psi';

export interface PsiDataGovV2Response {
  code: number;
  data: {
    regionMetadata: Array<{
      name: string;
      labelLocation: {
        latitude: number;
        longitude: number;
      };
    }>;
    items: Array<{
      date: string;
      updatedTimestamp: string;
      timestamp: string;
      readings: {
        psi_twenty_four_hourly: Record<string, number>;
        pm25_twenty_four_hourly?: Record<string, number>;
        pm25_sub_index?: Record<string, number>;
        pm10_twenty_four_hourly?: Record<string, number>;
        pm10_sub_index?: Record<string, number>;
        o3_eight_hour_max?: Record<string, number>;
        o3_sub_index?: Record<string, number>;
        no2_one_hour_max?: Record<string, number>;
        so2_twenty_four_hourly?: Record<string, number>;
        so2_sub_index?: Record<string, number>;
        co_eight_hour_max?: Record<string, number>;
        co_sub_index?: Record<string, number>;
      };
    }>;
  };
  errorMsg?: string;
}

export interface FormattedServerlessPsiResponse {
  success: boolean;
  source: string;
  endpoint: string;
  retrievedAt: string;
  observationTimestamp?: string;
  updatedTimestamp?: string;
  summary: {
    nationalMaxPsi: number;
    highestRegion: string;
    overallHealthBand: string;
  };
  regional: {
    psi_twenty_four_hourly: Record<string, number>;
    pm25_twenty_four_hourly?: Record<string, number>;
    pm10_twenty_four_hourly?: Record<string, number>;
    o3_eight_hour_max?: Record<string, number>;
    no2_one_hour_max?: Record<string, number>;
    so2_twenty_four_hourly?: Record<string, number>;
    co_eight_hour_max?: Record<string, number>;
  };
  raw: any;
}

function determineHealthBand(psi: number): string {
  if (psi <= 50) return 'Good';
  if (psi <= 100) return 'Moderate';
  if (psi <= 200) return 'Unhealthy';
  if (psi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Fetch PSI data from data.gov.sg with automatic fallback
 */
async function fetchPsiFromDataGov(): Promise<FormattedServerlessPsiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7500);

  let rawData: any = null;
  let usedUrl = PRIMARY_DATA_GOV_PSI_URL;

  try {
    const res = await fetch(PRIMARY_DATA_GOV_PSI_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      rawData = await res.json();
    } else {
      throw new Error(`Primary endpoint returned status ${res.status}`);
    }
  } catch (primaryErr) {
    // If primary v2 fails, try v1 fallback
    usedUrl = FALLBACK_DATA_GOV_PSI_URL;
    const fallbackRes = await fetch(FALLBACK_DATA_GOV_PSI_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!fallbackRes.ok) {
      throw new Error(`Data.gov.sg fallback endpoint error: ${fallbackRes.status}`);
    }
    rawData = await fallbackRes.json();
  } finally {
    clearTimeout(timeoutId);
  }

  // Parse readings from data.gov.sg payload (v2 format or v1 format)
  const items = rawData?.data?.items || rawData?.items || [];
  const latestItem = items.length > 0 ? items[items.length - 1] : null;

  if (!latestItem || !latestItem.readings) {
    throw new Error('Malformed or empty payload from data.gov.sg');
  }

  const readings = latestItem.readings;
  const psiMap: Record<string, number> = readings.psi_twenty_four_hourly || {};

  let highestRegion = 'national';
  let maxPsi = 0;

  for (const [region, val] of Object.entries(psiMap)) {
    if (typeof val === 'number' && val > maxPsi) {
      maxPsi = val;
      highestRegion = region;
    }
  }

  return {
    success: true,
    source: 'https://data.gov.sg',
    endpoint: usedUrl,
    retrievedAt: new Date().toISOString(),
    observationTimestamp: latestItem.timestamp,
    updatedTimestamp: latestItem.updatedTimestamp || latestItem.update_timestamp,
    summary: {
      nationalMaxPsi: maxPsi,
      highestRegion,
      overallHealthBand: determineHealthBand(maxPsi),
    },
    regional: {
      psi_twenty_four_hourly: psiMap,
      pm25_twenty_four_hourly: readings.pm25_twenty_four_hourly || readings.pm25_sub_index,
      pm10_twenty_four_hourly: readings.pm10_twenty_four_hourly,
      o3_eight_hour_max: readings.o3_eight_hour_max,
      no2_one_hour_max: readings.no2_one_hour_max,
      so2_twenty_four_hourly: readings.so2_twenty_four_hourly,
      co_eight_hour_max: readings.co_eight_hour_max,
    },
    raw: rawData,
  };
}

/**
 * Serverless Handler for GET /api/psi
 * Supports Express, AWS Lambda HTTP adapters, Vercel, and standalone Node HTTP
 */
export default async function handler(req: Request | any, res: Response | any) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.status?.(204).end?.();
      return;
    }
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const data = await fetchPsiFromDataGov();

    // Cache responses for 5 minutes (data.gov.sg refreshes hourly)
    const cacheHeader = 'public, s-maxage=300, stale-while-revalidate=60';

    if (res && typeof res.status === 'function' && typeof res.json === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', cacheHeader);
      return res.status(200).json(data);
    }

    if (res && typeof res.writeHead === 'function') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': cacheHeader,
      });
      res.end(JSON.stringify(data));
      return;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': cacheHeader,
      },
    });
  } catch (error: any) {
    const errorPayload = {
      success: false,
      error: error.message || 'Failed to retrieve PSI data from data.gov.sg',
      timestamp: new Date().toISOString(),
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(502).json(errorPayload);
    }

    return new Response(JSON.stringify(errorPayload), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

/**
 * Standard Web Fetch API GET Route Handler (Vercel Edge, Next.js, Cloudflare Workers)
 */
export async function GET(request?: Request | any) {
  try {
    const data = await fetchPsiFromDataGov();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to retrieve PSI data from data.gov.sg',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
