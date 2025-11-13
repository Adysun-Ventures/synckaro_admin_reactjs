import { NextRequest, NextResponse } from 'next/server';

/**
 * API Proxy Route
 * 
 * Proxies all API requests to the backend to avoid CORS issues.
 * Works on both local development and Netlify deployments.
 * 
 * Usage: /api/proxy/common/login -> http://170.187.250.145/common/login
 */

// Backend API URL - uses env variable if available, otherwise defaults to development URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://170.187.250.145';

/**
 * Handle all HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
 * Note: In Next.js 16+, params is a Promise that must be awaited
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PATCH');
}

/**
 * Handle OPTIONS for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Main request handler that proxies requests to the backend
 */
async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // Reconstruct the backend path from the catch-all route
    const pathSegments = params.path || [];
    const backendPath = `/${pathSegments.join('/')}`;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const urlWithQuery = queryString ? `${backendPath}?${queryString}` : backendPath;

    // Construct full backend URL
    const backendUrl = `${BACKEND_API_URL}${urlWithQuery}`;

    // Get request body (if any) - DELETE requests can also have a body
    let body: any = null;
    if (method !== 'GET') {
      try {
        body = await request.json();
      } catch {
        // No body or invalid JSON, try text
        try {
          const text = await request.text();
          body = text || null;
        } catch {
          body = null;
        }
      }
    }

    // Get headers (exclude host and other Next.js specific headers)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Skip headers that shouldn't be forwarded
      if (
        !key.toLowerCase().startsWith('x-forwarded') &&
        key.toLowerCase() !== 'host' &&
        key.toLowerCase() !== 'connection' &&
        key.toLowerCase() !== 'content-length'
      ) {
        headers[key] = value;
      }
    });

    // Prepare headers for backend request
    const backendHeaders: Record<string, string> = { ...headers };
    
    // Set Content-Type only if there's a body and it's not already set
    if (body && !backendHeaders['Content-Type'] && !backendHeaders['content-type']) {
      backendHeaders['Content-Type'] = 'application/json';
    }

    // Make request to backend
    const response = await fetch(backendUrl, {
      method,
      headers: backendHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Get response data
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Create response with CORS headers
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': contentType || 'application/json',
      },
    });
  } catch (error: any) {
    // Handle errors
    console.error('[API Proxy Error]', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Proxy Error',
        message: error.message || 'Failed to proxy request to backend',
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

