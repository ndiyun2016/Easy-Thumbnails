import React from 'react';
import Header from './components/Header';
import ThumbnailGenerator from './components/ThumbnailGenerator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f0f12] text-white selection:bg-cyan-500/30">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-cyan-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10">
        <Header />
        <main className="flex flex-col items-center">
          <div className="w-full max-w-4xl mx-auto text-center pt-12 pb-4 px-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Viral Thumbnails</span> in Seconds
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Upload your selfie, add a catchy title, and let our AI generate a high-CTR, neon-styled thumbnail for your next video.
            </p>
          </div>
          <ThumbnailGenerator />
        </main>
        
        <footer className="w-full py-8 text-center text-gray-600 text-sm border-t border-white/5 mt-12">
          <p>© {new Date().getFullYear()} NeonThumb AI. Powered by Google Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
