'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  Video as VideoIcon,
  Loader2,
  Download,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Sparkles,
} from 'lucide-react';
import VideoUploadZone from '@/components/VideoUploadZone';
import { VHSProcessor, VHSSettings, VHS_PRESETS } from '@/lib/vhsProcessor';

type PresetKey = 'clean' | 'authentic' | 'worn' | 'degraded';

export default function VideoToVHSPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<PresetKey>('authentic');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [settings, setSettings] = useState<VHSSettings>(VHS_PRESETS.authentic);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setSettings(VHS_PRESETS[currentPreset]);
  }, [currentPreset]);

  const handleVideoChange = (video: string | null, file: File | null) => {
    setVideoSrc(video);
    setVideoFile(file);
    setProcessedVideoUrl(null);
    setProgress(0);
  };

  const handleProcessVideo = async () => {
    if (!videoRef.current || !canvasRef.current || !videoFile) return;

    setProcessing(true);
    setProgress(0);
    setProcessedVideoUrl(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;

      // Wait for video metadata
      await new Promise((resolve) => {
        if (video.readyState >= 2) {
          resolve(null);
        } else {
          video.addEventListener('loadedmetadata', () => resolve(null), { once: true });
        }
      });

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Initialize VHS processor
      const processor = new VHSProcessor(settings);

      // Calculate frame extraction parameters
      const fps = settings.targetFPS || 30;
      const duration = video.duration;
      const totalFrames = Math.floor(duration * fps);
      const frameInterval = 1 / fps;

      console.log(`Processing ${totalFrames} frames at ${fps} FPS for ${duration.toFixed(2)}s video`);

      // STEP 1: Extract and process all frames
      const processedFrames: ImageData[] = [];
      video.pause();

      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        // Seek to exact frame time
        const targetTime = Math.min(frameIndex * frameInterval, duration);
        video.currentTime = targetTime;

        // Wait for seek to complete
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked, { once: true });
          
          // Fallback timeout
          setTimeout(resolve, 50);
        });

        // Draw current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Apply VHS effects
        const processedCanvas = processor.processFrame(canvas);
        
        // Store processed frame as ImageData
        const processedCtx = processedCanvas.getContext('2d')!;
        const frameData = processedCtx.getImageData(0, 0, canvas.width, canvas.height);
        processedFrames.push(frameData);

        // Update progress (50% for extraction/processing)
        setProgress((frameIndex / totalFrames) * 50);
      }

      console.log(`Extracted and processed ${processedFrames.length} frames`);

      // STEP 2: Encode frames to video at correct FPS
      const stream = canvas.captureStream(fps);
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

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setProcessedVideoUrl(url);
        setProcessing(false);
        setProgress(100);
        console.log('Video encoding complete');
      };

      // Start recording
      mediaRecorder.start();

      // STEP 3: Draw frames at precise timing using requestAnimationFrame
      let currentFrameIndex = 0;
      const startTime = performance.now();
      const frameDuration = 1000 / fps; // milliseconds per frame

      const drawFrame = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const targetFrameIndex = Math.floor(elapsed / frameDuration);

        // Draw all frames that should have been drawn by now
        while (currentFrameIndex <= targetFrameIndex && currentFrameIndex < processedFrames.length) {
          ctx.putImageData(processedFrames[currentFrameIndex], 0, 0);
          currentFrameIndex++;

          // Update progress (50-100% for encoding)
          setProgress(50 + (currentFrameIndex / processedFrames.length) * 50);
        }

        // Continue until all frames are drawn
        if (currentFrameIndex < processedFrames.length) {
          requestAnimationFrame(drawFrame);
        } else {
          // All frames drawn, stop recording after a small delay
          setTimeout(() => {
            mediaRecorder.stop();
          }, 200);
        }
      };

      // Start drawing frames
      requestAnimationFrame(drawFrame);

    } catch (error) {
      console.error('Processing error:', error);
      setProcessing(false);
      alert('Error processing video. Please try again.');
    }
  };

  const handleDownload = () => {
    if (!processedVideoUrl) return;

    const a = document.createElement('a');
    a.href = processedVideoUrl;
    a.download = `vhs-${videoFile?.name || 'video'}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePlayPause = () => {
    if (!processedVideoRef.current) return;
    
    if (isPlaying) {
      processedVideoRef.current.pause();
    } else {
      processedVideoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setVideoSrc(null);
    setVideoFile(null);
    setProcessedVideoUrl(null);
    setProgress(0);
    setCurrentPreset('authentic');
    setSettings(VHS_PRESETS.authentic);
  };

  const updateSetting = (key: keyof VHSSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2">
                Video to VHS
              </h1>
              <p className="text-gray-400">
                Apply authentic VHS degradation effects to your videos
              </p>
            </div>
            {videoSrc && (
              <button
                onClick={handleReset}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Upload Section */}
            <div className="card">
              <label className="block text-sm font-medium text-white mb-3 uppercase tracking-wider">
                Upload Video
              </label>
              <VideoUploadZone
                video={videoSrc}
                onVideoChange={handleVideoChange}
                maxSizeMB={500}
              />
            </div>

            {/* Presets */}
            {videoSrc && (
              <>
                <div className="card">
                  <label className="block text-sm font-medium text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    VHS Presets
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(VHS_PRESETS) as PresetKey[]).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setCurrentPreset(preset)}
                        disabled={processing}
                        className={`py-3 px-4 rounded-lg border transition-all font-medium capitalize ${
                          currentPreset === preset
                            ? 'border-primary-600 bg-primary-600/10 text-primary-400'
                            : 'border-dark-800 hover:border-primary-900/50 text-gray-400'
                        } disabled:opacity-50`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="card">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <span className="text-sm font-medium text-white uppercase tracking-wider flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Advanced Settings
                    </span>
                    <motion.div
                      animate={{ rotate: showAdvanced ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        {/* Color Settings */}
                        <div className="space-y-3 border-t border-dark-800 pt-4">
                          <h4 className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                            Color & Quality
                          </h4>
                          
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                              Saturation: {settings.saturation}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="200"
                              value={settings.saturation}
                              onChange={(e) => updateSetting('saturation', parseInt(e.target.value))}
                              className="w-full"
                              disabled={processing}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                              Brightness: {settings.brightness}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="200"
                              value={settings.brightness}
                              onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
                              className="w-full"
                              disabled={processing}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                              Contrast: {settings.contrast}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="200"
                              value={settings.contrast}
                              onChange={(e) => updateSetting('contrast', parseInt(e.target.value))}
                              className="w-full"
                              disabled={processing}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                              Color Shift: {settings.colorShift}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={settings.colorShift}
                              onChange={(e) => updateSetting('colorShift', parseInt(e.target.value))}
                              className="w-full"
                              disabled={processing}
                            />
                          </div>
                        </div>

                        {/* VHS Artifacts */}
                        <div className="space-y-3 border-t border-dark-800 pt-4">
                          <h4 className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                            VHS Artifacts
                          </h4>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                              Chromatic Aberration: {settings.chromaticAberration}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={settings.chromaticAberration}
                              onChange={(e) => updateSetting('chromaticAberration', parseInt(e.target.value))}
                              className="w-full"
                              disabled={processing}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                              Noise: {settings.noise}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={settings.noise}
                              onChange={(e) => updateSetting('noise', parseInt(e.target.value))}
                              className="w-full"
                              disabled={processing}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                              Scan Lines: {settings.scanLines}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={settings.scanLines}
                              onChange={(e) => updateSetting('scanLines', parseInt(e.target.value))}
                              className="w-full"
                              disabled={processing}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                              Tracking Error: {settings.trackingError}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={settings.trackingError}
                              onChange={(e) => updateSetting('trackingError', parseInt(e.target.value))}
                              className="w-full"
                              disabled={processing}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                              Ghosting: {settings.ghosting}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={settings.ghosting}
                              onChange={(e) => updateSetting('ghosting', parseInt(e.target.value))}
                              className="w-full"
                              disabled={processing}
                            />
                          </div>
                        </div>

                        {/* Effects */}
                        <div className="space-y-3 border-t border-dark-800 pt-4">
                          <h4 className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                            Effects
                          </h4>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                              Blur: {settings.blur}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="5"
                              step="0.5"
                              value={settings.blur}
                              onChange={(e) => updateSetting('blur', parseFloat(e.target.value))}
                              className="w-full"
                              disabled={processing}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                              Vignette: {settings.vignette}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={settings.vignette}
                              onChange={(e) => updateSetting('vignette', parseInt(e.target.value))}
                              className="w-full"
                              disabled={processing}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <label className="text-xs text-gray-400">
                              Date Stamp
                            </label>
                            <button
                              onClick={() => updateSetting('dateStamp', !settings.dateStamp)}
                              disabled={processing}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.dateStamp ? 'bg-primary-600' : 'bg-dark-800'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.dateStamp ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          {settings.dateStamp && (
                            <div>
                              <input
                                type="text"
                                value={settings.dateStampText}
                                onChange={(e) => updateSetting('dateStampText', e.target.value)}
                                placeholder="JAN 15 1997"
                                className="input-field text-sm"
                                disabled={processing}
                              />
                            </div>
                          )}
                        </div>

                        {/* Playback Settings */}
                        <div className="space-y-3 border-t border-dark-800 pt-4">
                          <h4 className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                            Playback
                          </h4>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                              Target FPS: {settings.targetFPS}
                            </label>
                            <input
                              type="range"
                              min="15"
                              max="60"
                              step="5"
                              value={settings.targetFPS}
                              onChange={(e) => updateSetting('targetFPS', parseInt(e.target.value))}
                              className="w-full"
                              disabled={processing}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>15 FPS</span>
                              <span>30 FPS</span>
                              <span>60 FPS</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Process Button */}
                <button
                  onClick={handleProcessVideo}
                  disabled={processing || !videoSrc}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing... {Math.round(progress)}%
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Apply VHS Effect
                    </>
                  )}
                </button>
              </>
            )}
          </motion.div>

          {/* Right Column - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="card min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-white uppercase tracking-wider">
                  Preview
                </h2>
                {processedVideoUrl && (
                  <div className="flex gap-2">
                    <button
                      onClick={handlePlayPause}
                      className="btn-secondary flex items-center gap-2 text-sm"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Play
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="btn-secondary flex items-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!videoSrc && !processedVideoUrl && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-gray-600"
                  >
                    <VideoIcon className="w-24 h-24 mb-4" strokeWidth={1} />
                    <p className="text-sm">Upload a video to get started</p>
                  </motion.div>
                )}

                {processing && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center"
                  >
                    <Loader2 className="w-12 h-12 text-primary-400 animate-spin mb-4" />
                    <p className="text-gray-400 mb-2">
                      Applying VHS effects...
                    </p>
                    <div className="w-64 bg-dark-800 rounded-full h-2 mb-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      {Math.round(progress)}%
                    </p>
                  </motion.div>
                )}

                {processedVideoUrl && !processing && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex-1"
                  >
                    <div className="relative w-full rounded-lg overflow-hidden bg-black border border-dark-800">
                      <video
                        ref={processedVideoRef}
                        src={processedVideoUrl}
                        controls
                        className="w-full h-auto"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-primary-600/10 border border-primary-900/50 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary-400" />
                      <span className="text-sm text-gray-300">
                        VHS effect applied successfully
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Hidden elements for processing */}
        <div style={{ display: 'none' }}>
          <video ref={videoRef} src={videoSrc || ''} />
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}

