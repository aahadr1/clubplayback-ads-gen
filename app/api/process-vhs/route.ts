import { NextRequest, NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { VHSSettings } from '@/lib/vhsProcessor';

// Increase timeout for video processing
export const maxDuration = 300; // 5 minutes max

export async function POST(req: NextRequest) {
  const tempDir = path.join(process.cwd(), 'tmp');
  let inputPath = '';
  let outputPath = '';

  try {
    // Ensure temp directory exists
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Parse form data
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const settingsJson = formData.get('settings') as string;

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    const settings: VHSSettings = JSON.parse(settingsJson);

    // Generate unique filenames
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    inputPath = path.join(tempDir, `input-${timestamp}-${randomId}.mp4`);
    outputPath = path.join(tempDir, `output-${timestamp}-${randomId}.mp4`);

    // Write uploaded file to temp directory
    const buffer = Buffer.from(await videoFile.arrayBuffer());
    await writeFile(inputPath, buffer);

    console.log(`Processing video: ${videoFile.name} (${(buffer.length / 1024 / 1024).toFixed(2)}MB)`);

    // Build FFmpeg filter chain
    const filters = buildFFmpegFilters(settings);
    console.log('Filter chain:', filters);

    // Process video with FFmpeg
    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .videoFilters(filters)
        .videoCodec('libx264')
        .addOption('-preset', 'fast') // Fast encoding for serverless
        .addOption('-crf', '23') // Good quality
        .addOption('-movflags', '+faststart')
        .audioCodec('aac')
        .audioBitrate('128k')
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${progress.percent?.toFixed(1)}%`);
        })
        .on('end', () => {
          console.log('Processing complete');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        });

      command.run();
    });

    // Read processed video
    const { readFile } = await import('fs/promises');
    const processedBuffer = await readFile(outputPath);

    // Cleanup temp files
    await Promise.all([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);

    // Return processed video
    return new NextResponse(processedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="vhs-${videoFile.name}"`,
      },
    });
  } catch (error: any) {
    console.error('Processing error:', error);

    // Cleanup on error
    if (inputPath) await unlink(inputPath).catch(() => {});
    if (outputPath) await unlink(outputPath).catch(() => {});

    return NextResponse.json(
      { error: error.message || 'Video processing failed' },
      { status: 500 }
    );
  }
}

function buildFFmpegFilters(settings: VHSSettings): string[] {
  const filters: string[] = [];

  // Blur
  if (settings.blur > 0) {
    filters.push(`boxblur=${settings.blur}:${settings.blur}`);
  }

  // Noise
  if (settings.noise > 0) {
    const noiseIntensity = Math.floor(settings.noise);
    filters.push(`noise=alls=${noiseIntensity}:allf=t+u`);
  }

  // Color adjustments
  const contrast = settings.contrast / 100;
  const brightness = (settings.brightness - 100) / 100;
  const saturation = settings.saturation / 100;
  filters.push(`eq=contrast=${contrast}:brightness=${brightness}:saturation=${saturation}`);

  // Hue/Color shift
  if (settings.colorShift !== 0) {
    const hueShift = settings.colorShift * 10;
    filters.push(`hue=h=${hueShift}`);
  }

  // Chromatic aberration (RGB shift)
  if (settings.chromaticAberration > 0) {
    const offset = Math.floor(settings.chromaticAberration);
    // Split channels, shift them, and merge
    filters.push(
      `split[main][copy]`,
      `[copy]chromakey=0x00ff00:0.1:0.1,colorkey=0x00ff00:0.1:0.1[shifted]`,
      `[main][shifted]blend=all_mode=screen`
    );
  }

  // Scan lines effect
  if (settings.scanLines > 0) {
    const intensity = settings.scanLines / 200;
    filters.push(`drawbox=x=0:y=ih/2:w=iw:h=2:color=black@${intensity}:t=fill`);
  }

  // Vignette
  if (settings.vignette > 0) {
    const strength = settings.vignette / 100;
    filters.push(`vignette=PI/4*${strength}`);
  }

  // Date stamp (using drawtext)
  if (settings.dateStamp && settings.dateStampText) {
    filters.push(
      `drawtext=text='${settings.dateStampText.replace(/'/g, "\\'")}':` +
      `fontcolor=white:fontsize=24:x=20:y=h-40:` +
      `shadowcolor=black:shadowx=2:shadowy=2`
    );
  }

  return filters;
}

