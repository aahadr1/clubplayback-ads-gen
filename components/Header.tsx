'use client';

import { useAppStore } from '@/lib/store';
import { Menu } from 'lucide-react';

export default function Header() {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <header className="sticky top-0 z-30 glass border-b h-16 flex items-center px-6">
      <button
        onClick={toggleSidebar}
        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors mr-4"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Image Generator
        </h2>
      </div>

      {/* User info or other header items can go here */}
    </header>
  );
}

