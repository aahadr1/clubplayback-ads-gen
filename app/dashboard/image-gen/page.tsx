'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSupabaseClient } from '@/lib/supabase';
import {
  Wand2,
  Image as ImageIcon,
  Loader2,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Settings,
} from 'lucide-react';
import Image from 'next/image';
import ImageUploadZone from '@/components/ImageUploadZone';

const aspectRatios = [
  { label: '1:1', value: '1:1', icon: '⬜' },
  { label: '16:9', value: '16:9', icon: '▭' },
  { label: '9:16', value: '9:16', icon: '▯' },
  { label: '4:3', value: '4:3', icon: '▬' },
  { label: '3:4', value: '3:4', icon: '▮' },
];

const outputFormats = [
  { label: 'JPG', value: 'jpg', desc: 'Smaller size' },
  { label: 'PNG', value: 'png', desc: 'Lossless' },
  { label: 'WebP', value: 'webp', desc: 'Modern' },
];

export default function ImageGenPage() {
  const [prompt, setPrompt] = useState('');
  const [imageInputs, setImageInputs] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [outputFormat, setOutputFormat] = useState('jpg');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    status: 'success' | 'error';
    message?: string;
  } | null>(null);
  const [userId, setUserId] = useState<string>('');
  const supabase = createSupabaseClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    loadUser();
  }, [supabase.auth]);


  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setResult({
        url: '',
        status: 'error',
        message: 'Please enter a prompt',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          image_input: imageInputs.length > 0 ? imageInputs : undefined,
          aspect_ratio: aspectRatio,
          output_format: outputFormat,
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          url: data.output_url,
          status: 'success',
        });
      } else {
        setResult({
          url: '',
          status: 'error',
          message: data.error || 'Generation failed',
        });
      }
    } catch (error: any) {
      setResult({
        url: '',
        status: 'error',
        message: error.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.url) return;
    
    try {
      const response = await fetch(result.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-${Date.now()}.${outputFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl blur-lg opacity-40" />
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Image Generation
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create stunning images with AI-powered generation
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Prompt */}
            <div className="card border-2 border-gray-200/80 dark:border-dark-700/80">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <label className="text-base font-bold text-gray-900 dark:text-white">
                  Prompt *
                </label>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate in detail..."
                rows={7}
                className="input-field resize-none text-base"
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Be specific and detailed for best results
                </p>
                <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                  {prompt.length} chars
                </span>
              </div>
            </div>

            {/* Image Inputs */}
            <div className="card border-2 border-gray-200/80 dark:border-dark-700/80">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                <label className="text-base font-bold text-gray-900 dark:text-white">
                  Reference Images <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
                </label>
              </div>
              <ImageUploadZone
                images={imageInputs}
                onImagesChange={setImageInputs}
                maxImages={3}
              />
            </div>

            {/* Settings */}
            <div className="card border-2 border-gray-200/80 dark:border-dark-700/80">
              <div className="flex items-center gap-2 mb-5">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <label className="text-base font-bold text-gray-900 dark:text-white">
                  Generation Settings
                </label>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {aspectRatios.map((ratio) => (
                      <motion.button
                        key={ratio.value}
                        onClick={() => setAspectRatio(ratio.value)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`py-3 px-2 rounded-xl border-2 transition-all font-semibold text-sm flex flex-col items-center gap-1 ${
                          aspectRatio === ratio.value
                            ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 shadow-lg shadow-primary-500/20'
                            : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600 bg-white dark:bg-dark-900/50 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-xl">{ratio.icon}</span>
                        <span>{ratio.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Output Format
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {outputFormats.map((format) => (
                      <motion.button
                        key={format.value}
                        onClick={() => setOutputFormat(format.value)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`py-3 px-4 rounded-xl border-2 transition-all font-semibold flex flex-col items-start ${
                          outputFormat === format.value
                            ? 'border-accent-500 bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 text-accent-700 dark:text-accent-300 shadow-lg shadow-accent-500/20'
                            : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600 bg-white dark:bg-dark-900/50 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-base">{format.label}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">{format.desc}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <motion.button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-bold">Generating your masterpiece...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <span className="font-bold">Generate Image</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="card border-2 border-gray-200/80 dark:border-dark-700/80 min-h-[700px] flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  Generated Result
                </h2>
                {result?.status === 'success' && (
                  <motion.button
                    onClick={handleDownload}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex items-center gap-2 py-2.5"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </motion.button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center"
                  >
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full blur-xl opacity-30 animate-pulse" />
                      <Loader2 className="relative w-20 h-20 text-primary-600 dark:text-primary-400 animate-spin" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Creating your image...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This may take a few moments
                    </p>
                  </motion.div>
                )}

                {!loading && !result && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600"
                  >
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gray-200 dark:bg-dark-800 rounded-3xl blur-2xl opacity-50" />
                      <ImageIcon className="relative w-32 h-32" strokeWidth={1.5} />
                    </div>
                    <p className="text-xl font-semibold mb-2">Your generated image will appear here</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Fill in the prompt and click generate
                    </p>
                  </motion.div>
                )}

                {!loading && result?.status === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex-1"
                  >
                    <div className="relative w-full h-full min-h-[550px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-dark-800 dark:to-dark-900 border-2 border-gray-200 dark:border-dark-700 shadow-inner">
                      <Image
                        src={result.url}
                        alt="Generated image"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-5 p-4 rounded-xl bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-2 border-success-200 dark:border-success-800 flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-6 h-6 text-success-600 dark:text-success-400 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-success-700 dark:text-success-300">
                          Generation successful!
                        </p>
                        <p className="text-xs text-success-600 dark:text-success-400">
                          Your image is ready to download
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {!loading && result?.status === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex-1 flex flex-col items-center justify-center"
                  >
                    <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 mb-4">
                      <AlertCircle className="w-20 h-20 text-red-500" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Generation failed
                    </p>
                    <p className="text-red-600 dark:text-red-400 text-center max-w-md">
                      {result.message || 'An error occurred during generation'}
                    </p>
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
