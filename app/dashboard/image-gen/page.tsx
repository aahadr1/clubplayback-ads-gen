'use client';

export const dynamic = 'force-dynamic';

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
} from 'lucide-react';
import Image from 'next/image';
import ImageUploadZone from '@/components/ImageUploadZone';

const aspectRatios = [
  { label: '1:1', value: '1:1' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
];

const outputFormats = [
  { label: 'JPG', value: 'jpg' },
  { label: 'PNG', value: 'png' },
  { label: 'WebP', value: 'webp' },
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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-semibold text-white mb-2">
            Image Generation
          </h1>
          <p className="text-gray-400">
            Create images with AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <label className="block text-sm font-medium text-white mb-3 uppercase tracking-wider">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                rows={6}
                className="input-field resize-none"
              />
              <p className="mt-2 text-xs text-gray-500">
                {prompt.length} characters
              </p>
            </div>

            <div className="card">
              <label className="block text-sm font-medium text-white mb-3 uppercase tracking-wider">
                Reference Images (Optional)
              </label>
              <ImageUploadZone
                images={imageInputs}
                onImagesChange={setImageInputs}
                maxImages={3}
              />
            </div>

            <div className="card">
              <label className="block text-sm font-medium text-white mb-4 uppercase tracking-wider">
                Settings
              </label>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => setAspectRatio(ratio.value)}
                        className={`py-2 px-3 rounded-lg border transition-all text-sm font-medium ${
                          aspectRatio === ratio.value
                            ? 'border-primary-600 bg-primary-600/10 text-primary-400'
                            : 'border-dark-800 hover:border-primary-900/50 text-gray-400'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">
                    Output Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {outputFormats.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setOutputFormat(format.value)}
                        className={`py-2 px-3 rounded-lg border transition-all text-sm font-medium ${
                          outputFormat === format.value
                            ? 'border-primary-600 bg-primary-600/10 text-primary-400'
                            : 'border-dark-800 hover:border-primary-900/50 text-gray-400'
                        }`}
                      >
                        {format.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="card min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-white uppercase tracking-wider">
                  Result
                </h2>
                {result?.status === 'success' && (
                  <button
                    onClick={handleDownload}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
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
                    <Loader2 className="w-12 h-12 text-primary-400 animate-spin mb-4" />
                    <p className="text-gray-400">
                      Creating your image...
                    </p>
                  </motion.div>
                )}

                {!loading && !result && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-gray-600"
                  >
                    <ImageIcon className="w-24 h-24 mb-4" strokeWidth={1} />
                    <p className="text-sm">Your generated image will appear here</p>
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
                    <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden bg-dark-800 border border-dark-800">
                      <Image
                        src={result.url}
                        alt="Generated image"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-primary-600/10 border border-primary-900/50 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary-400" />
                      <span className="text-sm text-gray-300">
                        Image generated successfully
                      </span>
                    </div>
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
                    <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                    <p className="text-gray-400 text-center">
                      {result.message || 'An error occurred'}
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
