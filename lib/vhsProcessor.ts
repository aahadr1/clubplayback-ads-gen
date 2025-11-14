export interface VHSSettings {
  // Color & Quality
  chromaticAberration: number; // 0-10
  colorShift: number; // 0-10
  saturation: number; // 0-200 (100 = normal)
  brightness: number; // 0-200 (100 = normal)
  contrast: number; // 0-200 (100 = normal)
  
  // VHS Artifacts
  noise: number; // 0-100
  scanLines: number; // 0-100
  trackingError: number; // 0-10
  ghosting: number; // 0-10
  
  // Video Quality
  sharpen: number; // 0-10
  blur: number; // 0-5
  
  // Effects
  vignette: number; // 0-100
  dateStamp: boolean;
  dateStampText: string;
}

export const VHS_PRESETS: { [key: string]: VHSSettings } = {
  clean: {
    chromaticAberration: 1,
    colorShift: 2,
    saturation: 95,
    brightness: 100,
    contrast: 105,
    noise: 5,
    scanLines: 10,
    trackingError: 0,
    ghosting: 1,
    sharpen: 0,
    blur: 0.5,
    vignette: 15,
    dateStamp: false,
    dateStampText: '',
  },
  authentic: {
    chromaticAberration: 3,
    colorShift: 5,
    saturation: 85,
    brightness: 95,
    contrast: 110,
    noise: 15,
    scanLines: 30,
    trackingError: 2,
    ghosting: 3,
    sharpen: 2,
    blur: 1,
    vignette: 30,
    dateStamp: true,
    dateStampText: 'JAN 15 1997',
  },
  worn: {
    chromaticAberration: 6,
    colorShift: 8,
    saturation: 75,
    brightness: 90,
    contrast: 115,
    noise: 35,
    scanLines: 50,
    trackingError: 5,
    ghosting: 6,
    sharpen: 3,
    blur: 2,
    vignette: 45,
    dateStamp: true,
    dateStampText: 'AUG 03 1988',
  },
  degraded: {
    chromaticAberration: 10,
    colorShift: 10,
    saturation: 65,
    brightness: 85,
    contrast: 125,
    noise: 60,
    scanLines: 70,
    trackingError: 8,
    ghosting: 9,
    sharpen: 5,
    blur: 3,
    vignette: 60,
    dateStamp: true,
    dateStampText: 'DEC 24 1982',
  },
};

export class VHSProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private settings: VHSSettings;
  private previousFrame: ImageData | null = null;

  constructor(settings: VHSSettings) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    this.settings = settings;
  }

  public processFrame(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
    // Set canvas size to match source
    if (
      this.canvas.width !== sourceCanvas.width ||
      this.canvas.height !== sourceCanvas.height
    ) {
      this.canvas.width = sourceCanvas.width;
      this.canvas.height = sourceCanvas.height;
    }

    // Draw source to our canvas
    this.ctx.drawImage(sourceCanvas, 0, 0);

    // Get image data
    let imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    // Apply effects in order
    imageData = this.applyColorAdjustments(imageData);
    imageData = this.applyChromaticAberration(imageData);
    imageData = this.applyNoise(imageData);
    imageData = this.applyGhosting(imageData);
    
    // Put processed data back
    this.ctx.putImageData(imageData, 0, 0);

    // Apply canvas-based effects
    this.applyBlur();
    this.applyScanLines();
    this.applyTrackingError();
    this.applyVignette();
    
    if (this.settings.dateStamp && this.settings.dateStampText) {
      this.applyDateStamp();
    }

    // Store for ghosting
    this.previousFrame = imageData;

    return this.canvas;
  }

  private applyColorAdjustments(imageData: ImageData): ImageData {
    const data = imageData.data;
    const { saturation, brightness, contrast, colorShift } = this.settings;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness & Contrast
      const brightnessFactor = brightness / 100;
      const contrastFactor = contrast / 100;
      
      r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255 * brightnessFactor;
      g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255 * brightnessFactor;
      b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255 * brightnessFactor;

      // Saturation
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      const satFactor = saturation / 100;
      r = gray + (r - gray) * satFactor;
      g = gray + (g - gray) * satFactor;
      b = gray + (b - gray) * satFactor;

      // Color shift (VHS warmth/magenta shift)
      const shiftAmount = colorShift / 10;
      r += shiftAmount * 8;
      g -= shiftAmount * 2;
      b += shiftAmount * 3;

      // Clamp values
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    return imageData;
  }

  private applyChromaticAberration(imageData: ImageData): ImageData {
    if (this.settings.chromaticAberration === 0) return imageData;

    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const offset = Math.floor(this.settings.chromaticAberration);
    
    const newData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Shift red channel left
        const redX = Math.max(0, x - offset);
        const redIdx = (y * width + redX) * 4;
        newData[idx] = data[redIdx];

        // Keep green channel
        newData[idx + 1] = data[idx + 1];

        // Shift blue channel right
        const blueX = Math.min(width - 1, x + offset);
        const blueIdx = (y * width + blueX) * 4;
        newData[idx + 2] = data[blueIdx + 2];
      }
    }

    return new ImageData(newData, width, height);
  }

  private applyNoise(imageData: ImageData): ImageData {
    if (this.settings.noise === 0) return imageData;

    const data = imageData.data;
    const noiseAmount = this.settings.noise / 100;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 255 * noiseAmount;
      data[i] += noise;
      data[i + 1] += noise;
      data[i + 2] += noise;
    }

    return imageData;
  }

  private applyGhosting(imageData: ImageData): ImageData {
    if (this.settings.ghosting === 0 || !this.previousFrame) return imageData;

    const data = imageData.data;
    const prevData = this.previousFrame.data;
    const ghostAmount = this.settings.ghosting / 20;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] * (1 - ghostAmount) + prevData[i] * ghostAmount;
      data[i + 1] = data[i + 1] * (1 - ghostAmount) + prevData[i + 1] * ghostAmount;
      data[i + 2] = data[i + 2] * (1 - ghostAmount) + prevData[i + 2] * ghostAmount;
    }

    return imageData;
  }

  private applyBlur(): void {
    if (this.settings.blur === 0) return;
    this.ctx.filter = `blur(${this.settings.blur}px)`;
    this.ctx.drawImage(this.canvas, 0, 0);
    this.ctx.filter = 'none';
  }

  private applyScanLines(): void {
    if (this.settings.scanLines === 0) return;

    const { width, height } = this.canvas;
    const intensity = this.settings.scanLines / 200;
    const lineSpacing = 2;

    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.fillStyle = `rgba(0, 0, 0, ${intensity})`;

    for (let y = 0; y < height; y += lineSpacing) {
      this.ctx.fillRect(0, y, width, 1);
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }

  private applyTrackingError(): void {
    if (this.settings.trackingError === 0) return;

    const { width, height } = this.canvas;
    const errorAmount = this.settings.trackingError;
    const numGlitches = Math.floor(errorAmount);

    // Create temporary canvas for the original
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(this.canvas, 0, 0);

    for (let i = 0; i < numGlitches; i++) {
      const y = Math.random() * height;
      const glitchHeight = 5 + Math.random() * 20;
      const offset = (Math.random() - 0.5) * errorAmount * 10;

      this.ctx.drawImage(
        tempCanvas,
        0, y, width, glitchHeight,
        offset, y, width, glitchHeight
      );
    }
  }

  private applyVignette(): void {
    if (this.settings.vignette === 0) return;

    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.sqrt(centerX * centerX + centerY * centerY);
    const intensity = this.settings.vignette / 100;

    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, radius * 0.3,
      centerX, centerY, radius
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.8})`);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  private applyDateStamp(): void {
    const { width, height } = this.canvas;
    const fontSize = Math.max(16, Math.floor(height / 30));
    
    this.ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.lineWidth = 2;
    
    const text = this.settings.dateStampText;
    const padding = 20;
    const x = padding;
    const y = height - padding;

    this.ctx.strokeText(text, x, y);
    this.ctx.fillText(text, x, y);
  }

  public updateSettings(settings: Partial<VHSSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }
}

