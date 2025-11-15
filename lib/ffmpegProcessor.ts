import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { VHSSettings } from './vhsProcessor';

export interface FFmpegProgress {
  ratio: number;
  time: number;
}

export class FFmpegVideoProcessor {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  async initialize(onProgress?: (progress: number) => void): Promise<void> {
    if (this.isLoaded) return;

    try {
      this.ffmpeg = new FFmpeg();
      
      // Load FFmpeg with progress tracking
      this.ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
      });

      this.ffmpeg.on('progress', ({ progress, time }: any) => {
        if (onProgress) {
          onProgress(progress * 100);
        }
      });

      // Load FFmpeg core
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.isLoaded = true;
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      throw new Error('Failed to initialize video processor');
    }
  }

  private buildFFmpegFilters(settings: VHSSettings): string {
    const filters: string[] = [];

    // Resolution & Sharpness (based on clean vs degraded)
    // Clean: minimal processing, Authentic: soft lens, Worn/Degraded: more degradation
    if (settings.blur > 0) {
      filters.push(`boxblur=${settings.blur}:${settings.blur}`);
    }

    // Noise/Grain
    if (settings.noise > 0) {
      const noiseIntensity = Math.floor(settings.noise / 100 * 100); // 0-100 scale
      filters.push(`noise=alls=${noiseIntensity}:allf=t+u`);
    }

    // Color adjustments
    const contrast = settings.contrast / 100;
    const brightness = (settings.brightness - 100) / 100; // Convert to -1 to 1 range
    const saturation = settings.saturation / 100;
    
    filters.push(`eq=contrast=${contrast}:brightness=${brightness}:saturation=${saturation}`);

    // Color shift (hue rotation)
    // Negative = cool/blue, Positive = warm/magenta
    if (settings.colorShift !== 0) {
      const hueShift = settings.colorShift * 10; // Scale to degrees
      const sat = 1.0; // Keep saturation
      filters.push(`hue=h=${hueShift}:s=${sat}`);
    }

    // Chromatic aberration simulation (split RGB channels)
    if (settings.chromaticAberration > 0) {
      const offset = Math.floor(settings.chromaticAberration);
      filters.push(`chromashift=crh=${offset}:crv=0:cbh=-${offset}:cbv=0`);
    }

    // Scan lines
    if (settings.scanLines > 0) {
      const intensity = settings.scanLines / 100;
      // Create horizontal lines effect
      filters.push(`drawbox=y=ih/2:color=black@${intensity}:width=iw:height=2:t=fill`);
    }

    // Vignette
    if (settings.vignette > 0) {
      const strength = settings.vignette / 100;
      filters.push(`vignette=${strength}`);
    }

    return filters.join(',');
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

      // Write input file to FFmpeg's virtual filesystem
      if (onProgress) onProgress(0, 'Loading video file...');
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Build filter chain
      const filterChain = this.buildFFmpegFilters(settings);
      console.log('FFmpeg filter chain:', filterChain);

      // Build FFmpeg command
      const args = [
        '-i', inputFileName,
        '-vf', filterChain,
        '-c:v', 'libx264', // H.264 codec
        '-preset', 'medium', // Balance between speed and quality
        '-crf', '23', // Quality (lower = better, 23 is good balance)
        '-c:a', 'aac', // Audio codec
        '-b:a', '128k', // Audio bitrate
        '-movflags', '+faststart', // Enable streaming
        '-y', // Overwrite output
        outputFileName
      ];

      if (onProgress) onProgress(5, 'Processing video with VHS effects...');

      // Execute FFmpeg
      await this.ffmpeg.exec(args);

      if (onProgress) onProgress(90, 'Finalizing output...');

      // Read output file
      const data = await this.ffmpeg.readFile(outputFileName);
      
      // Convert to Blob (create a new Uint8Array from the buffer to satisfy TypeScript)
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
        // FFmpeg.wasm doesn't have explicit cleanup, but we can terminate
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

