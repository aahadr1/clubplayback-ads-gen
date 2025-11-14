'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Image, ListChecks, Sparkles, TrendingUp, Zap } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();
  const [stats, setStats] = useState({
    totalGenerations: 0,
    recentGenerations: 0,
  });
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.email?.split('@')[0] || 'User');
        
        // Load stats
        const { count: total } = await supabase
          .from('generations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: recent } = await supabase
          .from('generations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', oneDayAgo);
        
        setStats({
          totalGenerations: total || 0,
          recentGenerations: recent || 0,
        });
      }
    };

    loadData();
  }, [supabase]);

  const cards = [
    {
      title: 'Create Images',
      description: 'Generate stunning AI images with nano-banana',
      icon: Image,
      href: '/dashboard/image-gen',
      gradient: 'from-primary-500 to-blue-500',
    },
    {
      title: 'View Tasks',
      description: 'Browse your generation history',
      icon: ListChecks,
      href: '/dashboard/tasks',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  const statCards = [
    {
      label: 'Total Generations',
      value: stats.totalGenerations,
      icon: Zap,
      color: 'text-primary-600 dark:text-primary-400',
      bgColor: 'bg-primary-50 dark:bg-primary-900/20',
    },
    {
      label: 'Last 24 Hours',
      value: stats.recentGenerations,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Create amazing images with AI-powered generation
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(card.href)}
                className="group relative overflow-hidden rounded-2xl p-8 text-left bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 hover:border-transparent hover:shadow-2xl transition-all"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                />
                <div className="relative">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.gradient} mb-4`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {card.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 glass rounded-2xl p-6 border border-primary-200 dark:border-primary-800"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
            <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Powered by Google's nano-banana
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              State-of-the-art image generation and editing model designed for fast,
              conversational, and multi-turn creative workflows.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

