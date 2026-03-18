import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    const data = await kv.get('image_urls');
    return NextResponse.json(data || {});
  } catch (error) {
    // Return empty object on error (likely missing KV config on localhost)
    console.warn('KV suppressed (likely local) for images');
    return NextResponse.json({});
  }
}
