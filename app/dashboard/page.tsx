'use client';

export const dynamic = 'force-dynamic';

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
      title: 'View History',
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-semibold text-white mb-2">
          Welcome back, {userName}
        </h1>
        <p className="text-gray-400">
          AI Image Generation Platform
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:border-primary-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-medium">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-semibold text-white">
                    {stat.value}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary-600/10 border border-primary-900/50">
                  <Icon className="w-7 h-7 text-primary-400" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-6">
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
                className="group card-interactive p-8 text-left hover:border-primary-600"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 rounded-lg bg-primary-600/10 border border-primary-900/50 group-hover:bg-primary-600 group-hover:border-primary-600 transition-all">
                    <Icon className="w-7 h-7 text-primary-400 group-hover:text-white transition-colors" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {card.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card border-primary-900/30"
      >
        <p className="text-sm text-gray-500">
          Powered by Google's nano-banana model
        </p>
      </motion.div>
    </div>
  );
}
