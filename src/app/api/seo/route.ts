import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';

const seoFilePath = path.join(process.cwd(), 'data', 'seo.json');

export async function GET() {
  let data = null;

  try {
    // Try KV first
    data = await kv.get('seo');
  } catch (kvError) {
    console.warn('KV suppressed (likely local):', kvError);
  }

  if (data) return NextResponse.json(data);
  
  // Fallback to local JSON if KV is empty or fails
  try {
    const localData = await fs.readFile(seoFilePath, 'utf8');
    return NextResponse.json(JSON.parse(localData));
  } catch (e) {
    // Fallback to hardcoded defaults
    return NextResponse.json({
      title: "The Regenerative Aesthetics",
      description: "Advanced aesthetic treatments at 82 Harley Street."
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updatedSeo = {
      title: body.title || "",
      description: body.description || ""
    };

    await kv.set('seo', updatedSeo);
    return NextResponse.json({ success: true, data: updatedSeo });
  } catch (error) {
    console.error("KV Write Error (SEO):", error);
    return NextResponse.json({ error: "Failed to update SEO" }, { status: 500 });
  }
}
