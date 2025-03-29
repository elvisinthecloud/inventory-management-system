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
    <div className="mb-8 flex items-center justify-between">
      <div className="relative pb-2 group">
        {/* Glowing effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-25 blur-sm group-hover:opacity-40 transition duration-300 rounded-lg"></div>
        
        <h1 className={`${robotoMono.className} text-3xl uppercase tracking-wider text-cyan-300 font-bold relative z-10`}>
          {title}
        </h1>
        
        {/* Underline effects */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-full"></div>
        <div className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-cyan-500 rounded-full transform translate-x-4 group-hover:translate-x-0 transition-transform duration-300"></div>
      </div>
      
      {withAction && (
        <div className="ml-4 relative">
          <div className="absolute -inset-1 rounded-lg opacity-25 bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm"></div>
          <div className="relative z-10">
            {withAction}
          </div>
        </div>
      )}
    </div>
  );
} 