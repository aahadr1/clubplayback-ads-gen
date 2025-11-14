'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Home, Image, ListChecks, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSupabaseClient } from '@/lib/supabase';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Image Gen', href: '/dashboard/image-gen', icon: Image },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ListChecks },
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-70 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-800 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-dark-800">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-light text-gray-900 dark:text-white">
                  ClubPlayback
                </h1>
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-dark-800">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
