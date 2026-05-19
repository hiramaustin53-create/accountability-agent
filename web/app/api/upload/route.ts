import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Initialize Supabase Admin Client (using service_role key for bypass RLS if needed, 
    // or anon key if bucket is public. For MVP, we use the anon key logic).
    // We read keys from environment variables.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage bucket 'audio'
    const { error } = await supabase.storage
      .from('audio')
      .upload(fileName, file, {
        contentType: file.type,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 });
    }

    // Get the public URL
    const { data } = supabase.storage.from('audio').getPublicUrl(fileName);

    return NextResponse.json({ publicUrl: data.publicUrl });

  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
