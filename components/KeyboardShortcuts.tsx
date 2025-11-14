'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Zap } from 'lucide-react';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

const shortcuts = [
  { key: '⌘ B', description: 'Toggle sidebar', category: 'Navigation' },
  { key: '⌘ H', description: 'Go to home', category: 'Navigation' },
  { key: '⌘ G', description: 'Go to image generation', category: 'Navigation' },
  { key: '⌘ T', description: 'Go to tasks', category: 'Navigation' },
  { key: '⌘ K', description: 'Show shortcuts', category: 'General' },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcut({
    key: 'k',
    metaKey: true,
    callback: () => setIsOpen(!isOpen),
  });

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 p-4 glass-strong rounded-2xl shadow-2xl hover:shadow-primary-500/20 transition-all group z-40 border-2 border-gray-200/60 dark:border-dark-700/60"
        aria-label="Show keyboard shortcuts"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
          <Keyboard className="relative w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-strong rounded-3xl p-8 max-w-lg w-full mx-4 z-50 border-2 border-gray-200/60 dark:border-dark-700/60"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 border border-primary-200 dark:border-primary-800">
                      <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Keyboard Shortcuts
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Boost your productivity with these shortcuts
                  </p>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>

              {/* Shortcuts List */}
              <div className="space-y-2 mb-6">
                {shortcuts.map((shortcut, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring', damping: 20 }}
                    className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-dark-800 dark:to-dark-800/50 hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-900/20 dark:hover:to-accent-900/20 border border-gray-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                  >
                    <div>
                      <span className="text-base font-semibold text-gray-900 dark:text-white block mb-0.5">
                        {shortcut.description}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {shortcut.category}
                      </span>
                    </div>
                    <kbd className="px-4 py-2 rounded-lg bg-white dark:bg-dark-900 border-2 border-gray-300 dark:border-dark-700 text-sm font-mono font-bold text-gray-900 dark:text-white shadow-sm group-hover:border-primary-400 dark:group-hover:border-primary-600 group-hover:shadow-md transition-all">
                      {shortcut.key}
                    </kbd>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-gray-200 dark:border-dark-700">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Press</span>
                  <kbd className="px-2.5 py-1 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-800 dark:to-dark-900 border border-gray-300 dark:border-dark-700 font-mono font-bold text-gray-900 dark:text-white shadow-sm">
                    ⌘ K
                  </kbd>
                  <span>anytime to toggle this dialog</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

