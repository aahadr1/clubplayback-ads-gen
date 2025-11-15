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
  AlertCircle,
  Zap,
} from 'lucide-react';
import VideoUploadZone from '@/components/VideoUploadZone';
import { VHSSettings, VHS_PRESETS } from '@/lib/vhsProcessor';

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
  const [processingMessage, setProcessingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<VHSSettings>(VHS_PRESETS.authentic);
  
  const processedVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setSettings(VHS_PRESETS[currentPreset]);
  }, [currentPreset]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl);
      }
    };
  }, [processedVideoUrl]);

  const handleVideoChange = (video: string | null, file: File | null) => {
    setVideoSrc(video);
    setVideoFile(file);
    setProcessedVideoUrl(null);
    setProgress(0);
    setError(null);
  };

  const handleProcessVideo = async () => {
    if (!videoFile) return;

    setProcessing(true);
    setProgress(0);
    setProcessedVideoUrl(null);
    setError(null);
    setProcessingMessage('Uploading video to server...');

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('settings', JSON.stringify(settings));

      setProcessingMessage('Processing video with native FFmpeg...');
      setProgress(10);

      // Send to API
      const response = await fetch('/api/process-vhs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      setProgress(90);
      setProcessingMessage('Finalizing...');

      // Get processed video blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedVideoUrl(url);
      
      setProgress(100);
      setProcessingMessage('Complete!');
    } catch (error: any) {
      console.error('Processing error:', error);
      setError(error.message || 'An error occurred while processing the video');
    } finally {
      setProcessing(false);
      setTimeout(() => setProcessingMessage(''), 3000);
    }
  };

  const handleDownload = () => {
    if (!processedVideoUrl) return;

    const a = document.createElement('a');
    a.href = processedVideoUrl;
    a.download = `vhs-${videoFile?.name.replace(/\.[^/.]+$/, '')}.mp4`;
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
    if (processedVideoUrl) {
      URL.revokeObjectURL(processedVideoUrl);
    }
    
    setVideoSrc(null);
    setVideoFile(null);
    setProcessedVideoUrl(null);
    setProgress(0);
    setError(null);
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
              <h1 className="text-3xl font-semibold text-white mb-2 flex items-center gap-2">
                Video to VHS
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-600/20 text-primary-400 text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  Native FFmpeg
                </span>
              </h1>
              <p className="text-gray-400">
                Professional server-side video processing • 10-20x faster than browser processing
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

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-400 mb-1">Error</h3>
              <p className="text-sm text-gray-300">{error}</p>
            </div>
          </motion.div>
        )}

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
                maxSizeMB={100}
              />
              <p className="mt-2 text-xs text-gray-500">
                Max 100MB • Processed on server with native FFmpeg
              </p>
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
                    disabled={processing}
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
                              Color Shift: {settings.colorShift} ({settings.colorShift < 0 ? 'Cool/Blue' : settings.colorShift > 0 ? 'Warm/Magenta' : 'Neutral'})
                            </label>
                            <input
                              type="range"
                              min="-10"
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
                              } disabled:opacity-50`}
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
                      <span className="flex-1 text-left">
                        {processingMessage || `Processing... ${Math.round(progress)}%`}
                      </span>
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
                    <p className="text-xs text-gray-500 mt-2">
                      Powered by native FFmpeg on the server
                    </p>
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
                    <p className="text-gray-400 mb-2 text-center px-4">
                      {processingMessage || 'Applying VHS effects...'}
                    </p>
                    <div className="w-64 bg-dark-800 rounded-full h-2 mb-2">
                      <motion.div
                        className="bg-primary-600 h-2 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      {Math.round(progress)}%
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      10-20x faster than browser processing
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
                        onEnded={() => setIsPlaying(false)}
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
      </div>
    </div>
  );
}