import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or type" }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(`ra-${type}.jpg`, file, {
      access: 'public',
    });

    // Store URL in KV mapping
    const imageMapping = (await kv.get<Record<string, string>>('image_urls')) || {};
    imageMapping[type] = blob.url;
    await kv.set('image_urls', imageMapping);

    return NextResponse.json({ success: true, url: blob.url, message: `Successfully uploaded ${type} to cloud.` });
  } catch (error) {
    console.error('Cloud Upload Error:', error);
    return NextResponse.json({ error: "Failed to upload to cloud" }, { status: 500 });
  }
}
