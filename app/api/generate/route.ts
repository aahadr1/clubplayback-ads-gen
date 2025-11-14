import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  // Initialize clients inside the route handler
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Supabase configuration is missing' },
      { status: 500 }
    );
  }

  if (!replicateToken) {
    return NextResponse.json(
      { error: 'Replicate API token is missing' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const replicate = new Replicate({ auth: replicateToken });
  try {
    const body = await req.json();
    const { prompt, image_input, aspect_ratio, output_format, user_id } = body;

    if (!prompt || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from('generations')
      .insert({
        user_id,
        prompt,
        image_inputs: image_input || null,
        aspect_ratio: aspect_ratio || null,
        output_format: output_format || null,
        status: 'processing',
        output_url: '',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Prepare input for Replicate
    const input: any = { prompt };
    if (image_input && image_input.length > 0) {
      input.image_input = image_input;
    }
    if (aspect_ratio) {
      input.aspect_ratio = aspect_ratio;
    }
    if (output_format) {
      input.output_format = output_format;
    }

    // Run the model
    try {
      const output = await replicate.run('google/nano-banana:latest', {
        input,
      });

      // Update generation with output
      const outputUrl = typeof output === 'string' ? output : (output as any)[0];
      
      await supabase
        .from('generations')
        .update({
          status: 'completed',
          output_url: outputUrl,
        })
        .eq('id', generation.id);

      return NextResponse.json({
        success: true,
        generation_id: generation.id,
        output_url: outputUrl,
      });
    } catch (replicateError: any) {
      // Update generation with error
      await supabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: replicateError.message,
        })
        .eq('id', generation.id);

      return NextResponse.json(
        { error: replicateError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

