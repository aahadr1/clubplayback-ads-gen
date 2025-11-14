'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
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
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Generation History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all your generated images
          </p>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by prompt..."
                className="input-field pl-10"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {(['all', 'completed', 'failed'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    filter === filterOption
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-700'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-800">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4" />
              <span>
                Showing {filteredGenerations.length} of {generations.length} generations
              </span>
            </div>
          </div>
        </motion.div>

        {/* Generations Grid */}
        {filteredGenerations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <ImageIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No generations found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? 'Try a different search query'
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
                className="card group hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedGeneration(generation)}
              >
                {/* Image Preview */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-800 mb-4">
                  {generation.status === 'completed' && generation.output_url ? (
                    <Image
                      src={generation.output_url}
                      alt={generation.prompt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {getStatusIcon(generation.status)}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium glass ${
                        generation.status === 'completed'
                          ? 'text-green-700 dark:text-green-300'
                          : generation.status === 'failed'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {getStatusLabel(generation.status)}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-2 font-medium">
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
                          handleDownload(
                            generation.output_url,
                            generation.output_format || 'jpg'
                          );
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

      {/* Detail Modal */}
      {selectedGeneration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedGeneration(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Generation Details
                </h2>
                <button
                  onClick={() => setSelectedGeneration(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Output Image */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Generated Image
                  </h3>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-800">
                    {selectedGeneration.status === 'completed' && selectedGeneration.output_url ? (
                      <Image
                        src={selectedGeneration.output_url}
                        alt={selectedGeneration.prompt}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {getStatusIcon(selectedGeneration.status)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Prompt
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 p-3 rounded-lg bg-gray-50 dark:bg-dark-800">
                      {selectedGeneration.prompt}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Status
                    </h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedGeneration.status)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getStatusLabel(selectedGeneration.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Aspect Ratio
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedGeneration.aspect_ratio || 'Default'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Format
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 uppercase">
                        {selectedGeneration.output_format || 'jpg'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Created
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedGeneration.created_at).toLocaleString()}
                    </p>
                  </div>

                  {selectedGeneration.image_inputs && selectedGeneration.image_inputs.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Reference Images
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedGeneration.image_inputs.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-800"
                          >
                            <Image src={img} alt={`Input ${idx + 1}`} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {selectedGeneration.error_message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

