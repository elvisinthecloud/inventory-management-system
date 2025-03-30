import React from 'react';
import { Roboto_Mono } from "next/font/google";

const robotoMono = Roboto_Mono({
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
    <div className={`${fullWidth ? '-mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12' : ''} mb-8`}>
      <div className="px-6 py-5 bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            {/* Square, professional header with a subtle border */}
            <h1 className={`${robotoMono.className} text-xl sm:text-2xl uppercase tracking-wide text-white border-l-4 border-gray-500 pl-4`}>
              {title}
            </h1>
          </div>
          
          {/* Action button area */}
          {withAction && (
            <div className="sm:ml-4">
              {withAction}
            </div>
          )}
        </div>
      </div>
      
      {/* Subtle divider line */}
      <div className="h-1 bg-gradient-to-r from-gray-700 to-gray-600"></div>
    </div>
  );
} 