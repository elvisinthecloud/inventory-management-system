import React from 'react';
import { Roboto_Mono } from "next/font/google";

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

interface PageHeaderProps {
  title: string;
  withAction?: React.ReactNode;
}

export default function PageHeader({ title, withAction }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between bg-gray-800 px-6 py-4 shadow-md">
        <div className="flex items-center">
          {/* Square, professional header with a subtle border */}
          <h1 className={`${robotoMono.className} text-2xl uppercase tracking-wide text-white border-l-4 border-gray-500 pl-4`}>
            {title}
          </h1>
        </div>
        
        {/* Action button area */}
        {withAction && (
          <div className="ml-4">
            {withAction}
          </div>
        )}
      </div>
      
      {/* Subtle divider line */}
      <div className="h-1 bg-gradient-to-r from-gray-700 to-gray-600"></div>
    </div>
  );
} 