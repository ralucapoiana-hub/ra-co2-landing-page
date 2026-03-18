import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'testimonials.json');

export async function GET() {
  let data = null;

  try {
    // Try KV first
    data = await kv.get('testimonials');
  } catch (kvError) {
    console.warn('KV suppressed (likely local):', kvError);
  }

  if (data && Array.isArray(data) && data.length > 0) {
    return NextResponse.json(data);
  }

  // Fallback to local JSON
  try {
    const localData = await fs.readFile(DATA_PATH, 'utf8');
    return NextResponse.json(JSON.parse(localData));
  } catch (e) {
    console.error('Local fallback error (Testimonials):', e);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await kv.set('testimonials', body);
    return NextResponse.json({ message: 'Testimonials updated successfully' });
  } catch (error) {
    console.error('KV Write Error (Testimonials):', error);
    return NextResponse.json({ message: 'Failed to update testimonials' }, { status: 500 });
  }
}
