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
  Filter,
  Download,
  Eye,
  Sparkles,
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
        return <CheckCircle2 className="w-5 h-5 text-success-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: Generation['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColors = (status: Generation['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 border-success-200 dark:border-success-800';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'processing':
        return 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
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
        <div className="text-center">
          <div className="relative mb-6 inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <Loader2 className="relative w-16 h-16 text-primary-600 dark:text-primary-400 animate-spin" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Loading your generations...</p>
        </div>
      </div>
    );
  }

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
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl blur-lg opacity-40" />
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Generation History
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and manage all your generated images
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card border-2 border-gray-200/80 dark:border-dark-700/80 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-5">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by prompt..."
                className="input-field pl-12"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {(['all', 'completed', 'failed'] as const).map((filterOption) => (
                <motion.button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all capitalize border-2 ${
                    filter === filterOption
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white border-primary-600 shadow-lg shadow-primary-500/30'
                      : 'bg-white dark:bg-dark-900/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600'
                  }`}
                >
                  {filterOption}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {filteredGenerations.length}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                of {generations.length} generations
              </span>
            </div>
          </div>
        </motion.div>

        {/* Generations Grid */}
        {filteredGenerations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center py-20 border-2 border-gray-200/80 dark:border-dark-700/80"
          >
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gray-200 dark:bg-dark-800 rounded-3xl blur-2xl opacity-50" />
              <ImageIcon className="relative w-24 h-24 mx-auto text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No generations found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
              {searchQuery
                ? 'Try a different search query or adjust your filters'
                : 'Start creating images to see them here'}
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
                className="card-interactive border-2 border-gray-200/80 dark:border-dark-700/80 group"
              >
                {/* Image Preview */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-dark-800 dark:to-dark-900 mb-5 border-2 border-gray-200 dark:border-dark-700">
                  {generation.status === 'completed' && generation.output_url ? (
                    <>
                      <Image
                        src={generation.output_url}
                        alt={generation.prompt}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {getStatusIcon(generation.status)}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 backdrop-blur-sm flex items-center gap-1.5 ${getStatusColors(generation.status)}`}>
                      {getStatusIcon(generation.status)}
                      {getStatusLabel(generation.status)}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-2 font-semibold leading-relaxed">
                    {generation.prompt}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(generation.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  {generation.status === 'completed' && (
                    <div className="flex gap-2 pt-2">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGeneration(generation);
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex-1 btn-secondary py-2.5 text-sm flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </motion.button>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(
                            generation.output_url,
                            generation.output_format || 'jpg'
                          );
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        Save
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedGeneration && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGeneration(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="glass-strong rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-auto border-2 border-gray-200/80 dark:border-dark-700/80 pointer-events-auto">
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Generation Details
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        View all information about this generation
                      </p>
                    </div>
                    <motion.button
                      onClick={() => setSelectedGeneration(null)}
                      whileHover={{ scale: 1.05, rotate: 90 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2.5 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-xl transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Output Image */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                        Generated Image
                      </h3>
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-dark-800 dark:to-dark-900 border-2 border-gray-200 dark:border-dark-700 shadow-inner">
                        {selectedGeneration.status === 'completed' && selectedGeneration.output_url ? (
                          <Image
                            src={selectedGeneration.output_url}
                            alt={selectedGeneration.prompt}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {getStatusIcon(selectedGeneration.status)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                          Prompt
                        </h3>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {selectedGeneration.prompt}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                          Status
                        </h3>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${getStatusColors(selectedGeneration.status)}`}>
                          {getStatusIcon(selectedGeneration.status)}
                          <span className="font-bold">
                            {getStatusLabel(selectedGeneration.status)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
                            Aspect Ratio
                          </h3>
                          <p className="text-base text-gray-700 dark:text-gray-300 font-semibold">
                            {selectedGeneration.aspect_ratio || 'Default'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
                            Format
                          </h3>
                          <p className="text-base text-gray-700 dark:text-gray-300 font-semibold uppercase">
                            {selectedGeneration.output_format || 'jpg'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
                          Created
                        </h3>
                        <p className="text-base text-gray-700 dark:text-gray-300">
                          {new Date(selectedGeneration.created_at).toLocaleString()}
                        </p>
                      </div>

                      {selectedGeneration.image_inputs && selectedGeneration.image_inputs.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                            Reference Images
                          </h3>
                          <div className="grid grid-cols-3 gap-3">
                            {selectedGeneration.image_inputs.map((img, idx) => (
                              <div
                                key={idx}
                                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-800 border-2 border-gray-200 dark:border-dark-700"
                              >
                                <Image src={img} alt={`Input ${idx + 1}`} fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedGeneration.status === 'completed' && (
                        <motion.button
                          onClick={() =>
                            handleDownload(
                              selectedGeneration.output_url,
                              selectedGeneration.output_format || 'jpg'
                            )
                          }
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Download Image
                        </motion.button>
                      )}

                      {selectedGeneration.error_message && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {selectedGeneration.error_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
