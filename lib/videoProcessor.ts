import { VHSProcessor, VHSSettings } from './vhsProcessor';

export interface ProcessingProgress {
  current: number;
  total: number;
  percentage: number;
}

export class VideoProcessor {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private vhsProcessor: VHSProcessor;
  private settings: VHSSettings;

  constructor(videoSrc: string, settings: VHSSettings) {
    this.settings = settings;
    this.vhsProcessor = new VHSProcessor(settings);
    
    // Create video element
    this.video = document.createElement('video');
    this.video.src = videoSrc;
    this.video.muted = true;
    this.video.playsInline = true;
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: false 
    })!;
  }

  private async waitForVideo(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.video.readyState >= 2) {
        resolve();
        return;
      }

      const handleLoad = () => {
        cleanup();
        resolve();
      };

      const handleError = () => {
        cleanup();
        reject(new Error('Failed to load video'));
      };

      const cleanup = () => {
        this.video.removeEventListener('loadeddata', handleLoad);
        this.video.removeEventListener('error', handleError);
      };

      this.video.addEventListener('loadeddata', handleLoad);
      this.video.addEventListener('error', handleError);
      this.video.load();
    });
  }

  private async seekToTime(time: number): Promise<void> {
    return new Promise((resolve) => {
      const seekHandler = () => {
        this.video.removeEventListener('seeked', seekHandler);
        // Small delay to ensure frame is ready
        setTimeout(() => resolve(), 50);
      };

      this.video.addEventListener('seeked', seekHandler);
      this.video.currentTime = time;

      // Fallback timeout
      setTimeout(() => {
        this.video.removeEventListener('seeked', seekHandler);
        resolve();
      }, 200);
    });
  }

  private captureFrame(): ImageData {
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  private processFrameData(imageData: ImageData): ImageData {
    // Apply VHS effects
    this.ctx.putImageData(imageData, 0, 0);
    const processedCanvas = this.vhsProcessor.processFrame(this.canvas);
    
    // Get processed data
    const tempCtx = processedCanvas.getContext('2d')!;
    return tempCtx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
  }

  public async processVideo(
    onProgress: (progress: ProcessingProgress) => void
  ): Promise<Blob> {
    try {
      // Wait for video to load
      await this.waitForVideo();

      // Set canvas dimensions
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;

      const duration = this.video.duration;
      const targetFPS = this.settings.targetFPS || 30;
      const frameInterval = 1 / targetFPS;
      const totalFrames = Math.floor(duration * targetFPS);

      console.log(`Processing: ${duration}s video at ${targetFPS} FPS = ${totalFrames} frames`);

      // Create output canvas for recording
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = this.canvas.width;
      outputCanvas.height = this.canvas.height;
      const outputCtx = outputCanvas.getContext('2d')!;

      // Setup MediaRecorder with exact frame rate
      const stream = outputCanvas.captureStream(0); // Manual frame control
      const videoTrack = stream.getVideoTracks()[0];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      // Return promise that resolves when recording is complete
      return new Promise(async (resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          console.log(`Output video size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
          resolve(blob);
        };

        mediaRecorder.onerror = (e) => {
          reject(new Error('MediaRecorder error: ' + e));
        };

        // Start recording
        mediaRecorder.start();

        // Process each frame
        for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
          const timestamp = frameNum * frameInterval;
          
          // Seek to exact frame time
          await this.seekToTime(Math.min(timestamp, duration - 0.001));
          
          // Capture and process frame
          const frameData = this.captureFrame();
          const processedData = this.processFrameData(frameData);
          
          // Draw to output canvas
          outputCtx.putImageData(processedData, 0, 0);
          
          // Manually trigger frame capture
          if ('requestFrame' in videoTrack) {
            // @ts-ignore - requestFrame is not in TypeScript definitions yet
            videoTrack.requestFrame();
          } else {
            // Fallback: force a paint
            stream.getVideoTracks()[0].enabled = false;
            stream.getVideoTracks()[0].enabled = true;
          }
          
          // Update progress
          const progress: ProcessingProgress = {
            current: frameNum + 1,
            total: totalFrames,
            percentage: ((frameNum + 1) / totalFrames) * 100
          };
          onProgress(progress);

          // Small delay to ensure frame is captured
          await new Promise(r => setTimeout(r, 1000 / targetFPS));
        }

        // Stop recording after a small delay
        setTimeout(() => {
          mediaRecorder.stop();
        }, 100);
      });
    } catch (error) {
      console.error('Video processing error:', error);
      throw error;
    }
  }

  public cleanup(): void {
    if (this.video) {
      this.video.pause();
      this.video.src = '';
      this.video.load();
    }
  }
}

// Alternative approach using frame extraction and WebCodecs API (if available)
export class AdvancedVideoProcessor {
  private frames: ImageData[] = [];
  private vhsProcessor: VHSProcessor;
  private settings: VHSSettings;

  constructor(settings: VHSSettings) {
    this.settings = settings;
    this.vhsProcessor = new VHSProcessor(settings);
  }

  public async extractFrames(
    videoSrc: string,
    onProgress: (progress: number) => void
  ): Promise<{ frames: ImageData[], width: number, height: number, duration: number }> {
    const video = document.createElement('video');
    video.src = videoSrc;
    video.muted = true;

    // Wait for metadata
    await new Promise((resolve, reject) => {
      video.addEventListener('loadedmetadata', resolve, { once: true });
      video.addEventListener('error', reject, { once: true });
      video.load();
    });

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    const duration = video.duration;
    const fps = this.settings.targetFPS || 30;
    const totalFrames = Math.floor(duration * fps);
    const frames: ImageData[] = [];

    console.log(`Extracting ${totalFrames} frames from ${duration}s video at ${fps} FPS`);

    for (let i = 0; i < totalFrames; i++) {
      const time = (i / fps);
      video.currentTime = Math.min(time, duration - 0.001);
      
      // Wait for seek
      await new Promise<void>((resolve) => {
        const seeked = () => {
          video.removeEventListener('seeked', seeked);
          setTimeout(() => resolve(), 50); // Wait for frame to be ready
        };
        video.addEventListener('seeked', seeked);
        setTimeout(() => {
          video.removeEventListener('seeked', seeked);
          resolve();
        }, 200);
      });

      // Capture frame
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      frames.push(imageData);
      
      onProgress((i + 1) / totalFrames * 50); // First 50% for extraction
    }

    video.pause();
    video.src = '';

    return { 
      frames, 
      width: canvas.width, 
      height: canvas.height,
      duration 
    };
  }

  public async processFrames(
    frames: ImageData[],
    width: number,
    height: number,
    duration: number,
    onProgress: (progress: number) => void
  ): Promise<Blob> {
    const fps = this.settings.targetFPS || 30;
    
    // Create canvases for processing
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputCtx = outputCanvas.getContext('2d')!;

    // Setup recording
    const stream = outputCanvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000,
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };

      mediaRecorder.onerror = reject;
      mediaRecorder.start();

      let frameIndex = 0;
      const frameInterval = 1000 / fps;
      
      const processNextFrame = () => {
        if (frameIndex >= frames.length) {
          setTimeout(() => mediaRecorder.stop(), 100);
          return;
        }

        // Process frame
        ctx.putImageData(frames[frameIndex], 0, 0);
        const processedCanvas = this.vhsProcessor.processFrame(canvas);
        
        // Draw to output
        outputCtx.drawImage(processedCanvas, 0, 0);
        
        onProgress(50 + (frameIndex / frames.length * 50)); // Second 50% for processing
        
        frameIndex++;
        setTimeout(processNextFrame, frameInterval);
      };

      processNextFrame();
    });
  }
}
