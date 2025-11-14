'use client';

import { useAppStore } from '@/lib/store';
import { Menu, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header() {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 glass-strong border-b border-gray-200/60 dark:border-dark-700/60 h-20 flex items-center px-6"
    >
      <div className="flex items-center gap-4 flex-1">
        <motion.button
          onClick={toggleSidebar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 hover:bg-gray-100/80 dark:hover:bg-dark-800/80 rounded-xl transition-all duration-200 group"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
        </motion.button>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl blur-md" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-200 dark:border-primary-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              AI Image Generator
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Powered by nano-banana
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
          <span className="status-dot-success" />
          <span className="text-xs font-semibold text-success-700 dark:text-success-300">
            Ready
          </span>
        </div>
      </div>
    </motion.header>
  );
}

