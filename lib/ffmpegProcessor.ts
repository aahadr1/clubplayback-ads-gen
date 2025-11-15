import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { VHSSettings } from './vhsProcessor';

export class FFmpegVideoProcessor {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  async initialize(onProgress?: (progress: number) => void, onMessage?: (message: string) => void): Promise<void> {
    if (this.isLoaded) return;

    try {
      this.ffmpeg = new FFmpeg();
      
      // Load FFmpeg with progress tracking
      this.ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
      });

      this.ffmpeg.on('progress', ({ progress }: any) => {
        if (onProgress && progress > 0) {
          onProgress(progress * 100);
        }
      });

      // Load FFmpeg core - use UMD build (works in production)
      // Downloads ~31MB but cached by browser after first load
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      if (onMessage) onMessage('Downloading FFmpeg (~31MB, cached after first load)...');
      console.log('Loading FFmpeg from CDN...');
      
      await this.ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      });

      this.isLoaded = true;
      console.log('FFmpeg loaded successfully');
      if (onMessage) onMessage('FFmpeg ready!');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      throw new Error('Failed to initialize video processor');
    }
  }

  private buildFFmpegFilters(settings: VHSSettings): string[] {
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

    // Chromatic aberration
    if (settings.chromaticAberration > 0) {
      const offset = Math.floor(settings.chromaticAberration);
      filters.push(`chromashift=crh=${offset}:crv=0:cbh=-${offset}:cbv=0`);
    }

    // Scan lines
    if (settings.scanLines > 0) {
      const intensity = settings.scanLines / 200;
      filters.push(`drawbox=x=0:y=ih/2:w=iw:h=2:color=black@${intensity}:t=fill`);
    }

    // Vignette
    if (settings.vignette > 0) {
      const strength = settings.vignette / 100;
      filters.push(`vignette=PI/4*${strength}`);
    }

    // Date stamp
    if (settings.dateStamp && settings.dateStampText) {
      const text = settings.dateStampText.replace(/'/g, "\\'").replace(/:/g, "\\:");
      filters.push(
        `drawtext=text='${text}':fontcolor=white:fontsize=24:x=20:y=h-40:shadowcolor=black:shadowx=2:shadowy=2`
      );
    }

    return filters;
  }

  async processVideo(
    file: File,
    settings: VHSSettings,
    onProgress?: (progress: number, message: string) => void
  ): Promise<Blob> {
    if (!this.ffmpeg || !this.isLoaded) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputFileName = 'input.mp4';
      const outputFileName = 'output.mp4';

      // Write input file
      if (onProgress) onProgress(0, 'Loading video file...');
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Build filter chain
      const filters = this.buildFFmpegFilters(settings);
      const filterString = filters.join(',');
      console.log('FFmpeg filter chain:', filterString);

      // Build FFmpeg command - optimized for browser
      const args = [
        '-i', inputFileName,
        '-vf', filterString,
        '-c:v', 'libx264',
        '-preset', 'ultrafast', // Fastest encoding
        '-crf', '28', // Lower quality for faster processing
        '-tune', 'fastdecode',
        '-movflags', '+faststart',
        '-c:a', 'copy', // Don't re-encode audio
        '-y',
        outputFileName
      ];

      if (onProgress) onProgress(5, 'Processing video (this may take a while)...');

      // Execute FFmpeg
      await this.ffmpeg.exec(args);

      if (onProgress) onProgress(90, 'Finalizing output...');

      // Read output file
      const data = await this.ffmpeg.readFile(outputFileName);
      const buffer = new Uint8Array(data as Uint8Array);
      const blob = new Blob([buffer], { type: 'video/mp4' });

      // Cleanup
      try {
        await this.ffmpeg.deleteFile(inputFileName);
        await this.ffmpeg.deleteFile(outputFileName);
      } catch (e) {
        console.warn('Cleanup warning:', e);
      }

      if (onProgress) onProgress(100, 'Complete!');

      return blob;
    } catch (error) {
      console.error('FFmpeg processing error:', error);
      throw new Error('Video processing failed: ' + (error as Error).message);
    }
  }

  async cleanup(): Promise<void> {
    if (this.ffmpeg) {
      try {
        this.isLoaded = false;
        this.ffmpeg = null;
      } catch (e) {
        console.warn('Cleanup warning:', e);
      }
    }
  }
}

// Singleton instance
let processorInstance: FFmpegVideoProcessor | null = null;

export async function getFFmpegProcessor(): Promise<FFmpegVideoProcessor> {
  if (!processorInstance) {
    processorInstance = new FFmpegVideoProcessor();
  }
  return processorInstance;
}

