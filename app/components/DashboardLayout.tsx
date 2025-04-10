'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  HomeIcon,
  FolderIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import ChatModal from './ChatModal';
import { useChat } from '../context/ChatContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { setIsOpen } = useChat();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/dashboard/projects', label: 'Projects', icon: FolderIcon },
    { href: '/dashboard/schedule', label: 'Schedule', icon: CalendarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-semibold text-gray-800 dark:text-white">
              Distinction
            </Link>
            <nav className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(true)}
              title="Open Assistant"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />
            </button>
            <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <BellIcon className="w-6 h-6 text-gray-500" />
            </button>
            <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Cog6ToothIcon className="w-6 h-6 text-gray-500" />
            </button>
            <div className="flex items-center ml-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <UserCircleIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </div>

      <ChatModal />
    </div>
  );
} 