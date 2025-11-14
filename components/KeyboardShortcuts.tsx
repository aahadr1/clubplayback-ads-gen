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
        className="fixed bottom-8 right-8 p-3 bg-dark-900 border border-dark-800 rounded-lg hover:border-primary-900/50 transition-all z-40"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="w-5 h-5 text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-900 border border-dark-800 rounded-lg p-6 max-w-md w-full mx-4 z-50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-dark-800 border border-dark-700"
                  >
                    <span className="text-gray-300">
                      {shortcut.description}
                    </span>
                    <kbd className="px-3 py-1.5 rounded-md bg-dark-900 border border-dark-800 text-sm font-mono text-white">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-center text-xs text-gray-500">
                Press <kbd className="px-2 py-1 rounded bg-dark-800 font-mono text-gray-400">⌘ K</kbd> to toggle
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
