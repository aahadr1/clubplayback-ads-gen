'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Image, ListChecks, TrendingUp, Zap, ArrowRight } from 'lucide-react';

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
      description: 'Generate images with AI',
      icon: Image,
      href: '/dashboard/image-gen',
    },
    {
      title: 'View Tasks',
      description: 'Browse generation history',
      icon: ListChecks,
      href: '/dashboard/tasks',
    },
  ];

  const statCards = [
    {
      label: 'Total Generations',
      value: stats.totalGenerations,
      icon: Zap,
    },
    {
      label: 'Last 24 Hours',
      value: stats.recentGenerations,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-2">
          Welcome back, {userName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          AI Image Generation
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-light text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-dark-800">
                  <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => router.push(card.href)}
                className="group card-interactive p-8 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-dark-800">
                    <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {card.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Powered by Google's nano-banana model
        </p>
      </motion.div>
    </div>
  );
}
