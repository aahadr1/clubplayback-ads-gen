'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

const shortcuts = [
  { key: '⌘ B', description: 'Toggle sidebar' },
  { key: '⌘ H', description: 'Go to home' },
  { key: '⌘ G', description: 'Go to image generation' },
  { key: '⌘ T', description: 'Go to tasks' },
  { key: '⌘ K', description: 'Show shortcuts' },
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
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 glass rounded-full shadow-lg hover:shadow-xl transition-all group z-40"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass rounded-2xl p-6 max-w-md w-full mx-4 z-50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-800"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <kbd className="px-3 py-1.5 rounded-md bg-white dark:bg-dark-900 border border-gray-300 dark:border-dark-700 text-sm font-mono text-gray-900 dark:text-white">
                      {shortcut.key}
                    </kbd>
                  </motion.div>
                ))}
              </div>

              <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                Press <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-dark-800 font-mono">⌘ K</kbd> to toggle this dialog
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

