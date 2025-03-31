import { NextResponse } from 'next/server';

/**
 * API route to proxy GraphQL requests to avoid CORS issues
 * Takes GraphQL endpoint, query, and variables and returns the response
 */
export async function POST(request: Request) {
  try {
    const { endpoint, query, variables } = await request.json();
    
    if (!endpoint || !query) {
      return NextResponse.json(
        { error: 'Endpoint URL and query are required' }, 
        { status: 400 }
      );
    }
    
    console.log(`Proxying GraphQL request to ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      }),
    });
    
    if (!response.ok) {
      console.error(`Error fetching GraphQL ${endpoint}: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `GraphQL API responded with status ${response.status}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GraphQL data' }, 
      { status: 500 }
    );
  }
} 