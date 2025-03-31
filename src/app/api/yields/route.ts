import { NextResponse } from 'next/server';

/**
 * API route to proxy REST API requests to avoid CORS issues
 * Takes endpoint URL and request parameters and returns the response
 */
export async function POST(request: Request) {
  try {
    const { endpoint, method = 'GET', data } = await request.json();
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint URL is required' }, 
        { status: 400 }
      );
    }
    
    console.log(`Proxying ${method} request to ${endpoint}`);
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (method === 'POST' && data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      console.error(`Error fetching ${endpoint}: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `API responded with status ${response.status}` }, 
        { status: response.status }
      );
    }
    
    const responseData = await response.json();
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' }, 
      { status: 500 }
    );
  }
} 