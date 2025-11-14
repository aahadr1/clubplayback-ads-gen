'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSupabaseClient } from '@/lib/supabase';
import Image from 'next/image';
import {
  Calendar,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Download,
  Eye,
  X,
} from 'lucide-react';

interface Generation {
  id: string;
  user_id: string;
  prompt: string;
  image_inputs: string[] | null;
  aspect_ratio: string | null;
  output_format: string | null;
  output_url: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
}

export default function TasksPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error('Error loading generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGenerations = generations.filter((gen) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'completed' && gen.status === 'completed') ||
      (filter === 'failed' && gen.status === 'failed');
    
    const matchesSearch =
      searchQuery === '' ||
      gen.prompt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: Generation['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-primary-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleDownload = async (url: string, format: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `generated-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-semibold text-white mb-2">
            Generation History
          </h1>
          <p className="text-gray-400">
            View and manage your generated images
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by prompt..."
                className="input-field pl-10"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'completed', 'failed'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize border ${
                    filter === filterOption
                      ? 'bg-primary-600/10 border-primary-600 text-primary-400'
                      : 'border-dark-800 hover:border-primary-900/50 text-gray-400'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            {filteredGenerations.length} of {generations.length} generations
          </div>
        </motion.div>

        {filteredGenerations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-20"
          >
            <ImageIcon className="w-24 h-24 mx-auto text-gray-700 mb-4" strokeWidth={1} />
            <h3 className="text-xl font-semibold text-white mb-2">
              No generations found
            </h3>
            <p className="text-gray-400">
              {searchQuery ? 'Try a different search query' : 'Start creating images'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGenerations.map((generation, index) => (
              <motion.div
                key={generation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedGeneration(generation)}
                className="card-interactive group hover:border-primary-600"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-dark-800 mb-4 border border-dark-800">
                  {generation.status === 'completed' && generation.output_url ? (
                    <Image
                      src={generation.output_url}
                      alt={generation.prompt}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      {getStatusIcon(generation.status)}
                    </div>
                  )}

                  <div className="absolute top-2 right-2">
                    <div className="px-2 py-1 rounded-md text-xs font-medium bg-dark-900/90 backdrop-blur-sm border border-dark-800">
                      {generation.status}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-white line-clamp-2">
                    {generation.prompt}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(generation.created_at).toLocaleDateString()}
                  </div>

                  {generation.status === 'completed' && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGeneration(generation);
                        }}
                        className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(generation.output_url, generation.output_format || 'jpg');
                        }}
                        className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedGeneration && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGeneration(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-900 border border-dark-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto p-8 z-50 m-6"
            >
              <div className="flex items-start justify-between mb-8">
                <h2 className="text-2xl font-semibold text-white">
                  Generation Details
                </h2>
                <button
                  onClick={() => setSelectedGeneration(null)}
                  className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm text-gray-500 mb-3 uppercase tracking-wider font-medium">
                    Generated Image
                  </h3>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-dark-800 border border-dark-800">
                    {selectedGeneration.status === 'completed' && selectedGeneration.output_url ? (
                      <Image
                        src={selectedGeneration.output_url}
                        alt={selectedGeneration.prompt}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        {getStatusIcon(selectedGeneration.status)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-medium">
                      Prompt
                    </h3>
                    <p className="text-sm text-gray-300">
                      {selectedGeneration.prompt}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-medium">
                        Aspect Ratio
                      </h3>
                      <p className="text-sm text-gray-300">
                        {selectedGeneration.aspect_ratio || 'Default'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-medium">
                        Format
                      </h3>
                      <p className="text-sm text-gray-300 uppercase">
                        {selectedGeneration.output_format || 'jpg'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-medium">
                      Created
                    </h3>
                    <p className="text-sm text-gray-300">
                      {new Date(selectedGeneration.created_at).toLocaleString()}
                    </p>
                  </div>

                  {selectedGeneration.status === 'completed' && (
                    <button
                      onClick={() =>
                        handleDownload(
                          selectedGeneration.output_url,
                          selectedGeneration.output_format || 'jpg'
                        )
                      }
                      className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download Image
                    </button>
                  )}

                  {selectedGeneration.error_message && (
                    <div className="p-3 rounded-lg bg-red-900/20 border border-red-900/50">
                      <p className="text-sm text-red-400">
                        {selectedGeneration.error_message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
