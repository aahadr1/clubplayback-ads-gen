'use client';

import { useAppStore } from '@/lib/store';
import { Menu } from 'lucide-react';

export default function Header() {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <header className="sticky top-0 z-30 bg-black border-b border-dark-800 h-16 flex items-center px-6">
      <button
        onClick={toggleSidebar}
        className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5 text-gray-400" />
      </button>

      <div className="flex-1 ml-4">
        <h2 className="text-lg font-semibold text-white">
          AI Image Generator
        </h2>
      </div>
    </header>
  );
}
