'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Image, ListChecks, Sparkles, TrendingUp, Zap, ArrowRight, Star } from 'lucide-react';

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
      gradient: 'from-primary-500 to-primary-600',
      accentColor: 'primary',
    },
    {
      title: 'View Tasks',
      description: 'Browse your generation history',
      icon: ListChecks,
      href: '/dashboard/tasks',
      gradient: 'from-accent-500 to-accent-600',
      accentColor: 'accent',
    },
  ];

  const statCards = [
    {
      label: 'Total Generations',
      value: stats.totalGenerations,
      icon: Zap,
      color: 'text-primary-600 dark:text-primary-400',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
      borderColor: 'border-primary-200 dark:border-primary-800/50',
      change: '+12%',
    },
    {
      label: 'Last 24 Hours',
      value: stats.recentGenerations,
      icon: TrendingUp,
      color: 'text-accent-600 dark:text-accent-400',
      bgColor: 'bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20',
      borderColor: 'border-accent-200 dark:border-accent-800/50',
      change: '+5%',
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
              Welcome back, <span className="gradient-text">{userName}</span>! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Create amazing images with AI-powered generation
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card border-2 ${stat.borderColor} hover:scale-[1.02] cursor-default`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 text-success-600 dark:text-success-400 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>{stat.change} this week</span>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bgColor} border ${stat.borderColor}`}>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Star className="w-4 h-4" />
            <span>Get started</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(card.href)}
                className="group relative overflow-hidden rounded-3xl p-8 text-left bg-white dark:bg-dark-900/50 border-2 border-gray-200/60 dark:border-dark-800/60 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                {/* Background Gradient Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
                
                {/* Content */}
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
                      <div className={`relative inline-flex p-4 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
        className="glass-strong rounded-3xl p-8 border-2 border-primary-200/60 dark:border-primary-800/60 relative overflow-hidden"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent-500/10 to-primary-500/10 rounded-full blur-3xl" />
        
        <div className="relative flex items-start gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl blur-lg opacity-40" />
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 border-2 border-primary-200 dark:border-primary-800">
              <Sparkles className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Powered by Google's nano-banana
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              State-of-the-art image generation and editing model designed for fast,
              conversational, and multi-turn creative workflows. Experience the future of AI creativity.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

