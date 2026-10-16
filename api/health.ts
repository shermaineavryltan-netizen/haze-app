import type { Request, Response } from 'express';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
}

/**
 * Serverless / Express Health Check Endpoint
 * Route: GET /api/health
 */
export default async function handler(req: Request | any, res: Response | any) {
  const healthData: HealthCheckResponse = {
    status: 'ok',
    service: 'sg-airalert-psi-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: typeof process !== 'undefined' && process.uptime ? Math.round(process.uptime()) : 0,
    environment: process.env.NODE_ENV || 'production',
  };

  // If running inside Express or Node HTTP serverless adapter
  if (res && typeof res.status === 'function' && typeof res.json === 'function') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(healthData);
  }

  // If raw Node ServerResponse
  if (res && typeof res.writeHead === 'function') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(healthData));
    return;
  }

  // Edge / Fetch standard Response (Vercel Edge, Cloudflare Workers, Next.js)
  return new Response(JSON.stringify(healthData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * Web Standards / Edge Runtime GET handler
 */
export async function GET(request?: Request | any) {
  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'sg-airalert-psi-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: typeof process !== 'undefined' && process.uptime ? Math.round(process.uptime()) : 0,
      environment: process.env.NODE_ENV || 'production',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
