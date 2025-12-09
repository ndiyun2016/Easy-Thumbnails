import React from 'react';
import { Zap, Youtube } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 md:px-8 flex items-center justify-between border-b border-white/10 bg-[#0f0f12]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="absolute inset-0 bg-pink-500 blur-lg opacity-50 rounded-full"></div>
          <Zap className="w-8 h-8 text-cyan-400 relative z-10" fill="currentColor" />
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500 tracking-tighter">
          NeonThumb AI
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <a 
          href="#" 
          className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <Youtube className="w-5 h-5" />
          <span>Creator Tools</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
