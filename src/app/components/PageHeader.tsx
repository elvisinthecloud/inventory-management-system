import React from 'react';
import { Inter } from "next/font/google";

const inter = Inter({
  weight: '700',
  subsets: ['latin'],
});

interface PageHeaderProps {
  title: string;
  withAction?: React.ReactNode;
  fullWidth?: boolean;
}

export default function PageHeader({ title, withAction, fullWidth = false }: PageHeaderProps) {
  return (
    <div className={`mb-6 ${fullWidth ? 'w-full' : ''}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <h1 className={`${inter.className} text-2xl sm:text-3xl font-bold text-gray-900`}>
              {title}
            </h1>
          </div>
          
          {withAction}
        </div>
      </div>
    </div>
  );
} 