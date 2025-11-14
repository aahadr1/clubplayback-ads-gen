'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Home, Image, ListChecks, LogOut, ChevronLeft, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSupabaseClient } from '@/lib/supabase';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home, shortcut: '⌘H' },
  { name: 'Image Gen', href: '/dashboard/image-gen', icon: Image, shortcut: '⌘G' },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ListChecks, shortcut: '⌘T' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const supabase = createSupabaseClient();

  // Keyboard shortcuts
  useKeyboardShortcut({ key: 'b', metaKey: true, callback: toggleSidebar });
  useKeyboardShortcut({ key: 'h', metaKey: true, callback: () => router.push('/dashboard') });
  useKeyboardShortcut({ key: 'g', metaKey: true, callback: () => router.push('/dashboard/image-gen') });
  useKeyboardShortcut({ key: 't', metaKey: true, callback: () => router.push('/dashboard/tasks') });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 35, stiffness: 350 }}
            className="fixed left-0 top-0 h-full w-80 glass-strong border-r border-gray-200/80 dark:border-dark-700/80 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200/60 dark:border-dark-800/60">
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl blur-md opacity-40" />
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white">
                      ClubPlayback
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      AI Studio
                    </p>
                  </div>
                </motion.div>
                <motion.button
                  onClick={toggleSidebar}
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-xl transition-all duration-200 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                </motion.button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-5 space-y-2 overflow-y-auto scrollbar-thin">
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
                  Navigation
                </p>
              </div>
              {navigation.map((item, index) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <motion.button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative w-full flex items-center justify-between group px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-dark-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 dark:bg-dark-800 group-hover:bg-gray-200 dark:group-hover:bg-dark-700'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <kbd className={`hidden sm:inline-flex px-2 py-1 rounded-md text-[10px] font-mono border transition-all ${
                      isActive
                        ? 'bg-white/10 border-white/20 text-white/70'
                        : 'bg-gray-100 dark:bg-dark-800 border-gray-200 dark:border-dark-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.shortcut}
                    </kbd>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200/60 dark:border-dark-800/60">
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-semibold group"
              >
                <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/40 transition-all">
                  <LogOut className="w-5 h-5" />
                </div>
                <span>Sign Out</span>
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

