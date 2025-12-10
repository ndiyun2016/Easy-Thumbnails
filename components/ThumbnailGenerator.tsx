import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, X, Download, RefreshCw, Wand2 } from 'lucide-react';
import { ColorTheme, ThumbnailGenerationState } from '../types';
import { generateThumbnail } from '../services/geminiService';

const ThumbnailGenerator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(ColorTheme.CYAN_PINK);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [state, setState] = useState<ThumbnailGenerationState>({
    isLoading: false,
    error: null,
    generatedImage: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setState(prev => ({ ...prev, error: "Image size must be less than 5MB" }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setState(prev => ({ ...prev, error: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      setState(prev => ({ ...prev, error: "Please upload a headshot first." }));
      return;
    }
    if (!title.trim()) {
      setState(prev => ({ ...prev, error: "Please enter a video title." }));
      return;
    }

    setState({ isLoading: true, error: null, generatedImage: null });

    try {
      const resultImage = await generateThumbnail(uploadedImage, title, selectedTheme);
      setState({ isLoading: false, error: null, generatedImage: resultImage });
    } catch (err: any) {
      setState({ isLoading: false, error: err.message, generatedImage: null });
    }
  };

  const handleDownload = () => {
    if (state.generatedImage) {
      try {
        // Netlify/Static hosting friendly: Convert base64 to blob to avoid URL length limits
        // and ensure the browser treats it as a file download stream.
        const byteString = atob(state.generatedImage.split(',')[1]);
        const mimeString = state.generatedImage.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const url = URL.createObjectURL(blob);

        const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `neonthumb-${safeTitle}-${Date.now()}.png`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (e) {
        console.error("Blob download failed, falling back to data URI", e);
        // Fallback for older browsers or obscure failures
        const link = document.createElement('a');
        link.href = state.generatedImage;
        link.download = `neonthumb-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto p-4 md:p-8">
      
      {/* Input Section */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-[#1a1a1d] rounded-2xl p-6 border border-white/5 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            Configuration
          </h2>

          {/* 1. Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              1. Upload Creator Headshot
            </label>
            {!uploadedImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 hover:border-cyan-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#121214] group"
              >
                <div className="bg-gray-800 group-hover:bg-gray-700 p-3 rounded-full mb-3 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 group-hover:text-cyan-400" />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  Click to upload or drag & drop<br/>
                  <span className="text-xs text-gray-600">PNG, JPG up to 5MB</span>
                </p>
              </div>
            ) : (
              <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/50">
                <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-contain" />
                <button 
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>

          {/* 2. Title Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              2. Video Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., I Spent 24 Hours in..."
              className="w-full bg-[#121214] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              maxLength={50}
            />
            <div className="text-right text-xs text-gray-600 mt-1">{title.length}/50</div>
          </div>

          {/* 3. Theme Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              3. Color Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(ColorTheme).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`relative p-3 rounded-lg border text-sm font-medium transition-all text-left overflow-hidden ${
                    selectedTheme === theme 
                      ? 'border-cyan-500 text-white bg-cyan-500/10' 
                      : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-[#222]'
                  }`}
                >
                  <span className="relative z-10">{theme}</span>
                  {/* Color preview orb */}
                  <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-xl -mr-8 -mt-8 opacity-40 transition-colors
                    ${theme === ColorTheme.CYAN_PINK ? 'bg-gradient-to-br from-cyan-400 to-pink-500' : ''}
                    ${theme === ColorTheme.PURPLE_BLUE ? 'bg-gradient-to-br from-purple-500 to-blue-600' : ''}
                    ${theme === ColorTheme.LIME_YELLOW ? 'bg-gradient-to-br from-lime-400 to-yellow-400' : ''}
                    ${theme === ColorTheme.ORANGE_RED ? 'bg-gradient-to-br from-orange-400 to-red-500' : ''}
                  `}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={state.isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
              ${state.isLoading 
                ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
              }`}
          >
            {state.isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Thumbnail
              </>
            )}
          </button>
          
          {state.error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg text-center">
              {state.error}
            </div>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="w-full lg:w-2/3">
         <div className="bg-[#1a1a1d] rounded-2xl p-2 md:p-6 border border-white/5 shadow-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-pink-400" />
                Result
              </h2>
              {state.generatedImage && (
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 text-sm px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>

            <div className="flex-grow flex items-center justify-center bg-[#000000] rounded-xl overflow-hidden border border-gray-800 relative aspect-video w-full group">
              {state.generatedImage ? (
                <img 
                  src={state.generatedImage} 
                  alt="Generated Thumbnail" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-600 p-8">
                  {state.isLoading ? (
                    <div className="flex flex-col items-center animate-pulse">
                       <div className="w-16 h-16 rounded-full border-4 border-t-cyan-500 border-r-transparent border-b-purple-500 border-l-transparent animate-spin mb-4"></div>
                       <p className="text-lg font-medium text-gray-400">AI is crafting your masterpiece...</p>
                       <p className="text-sm text-gray-600 mt-2">This may take 10-20 seconds</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center mb-4">
                        <ImageIcon className="w-10 h-10 opacity-30" />
                      </div>
                      <p className="text-lg">Your generated thumbnail will appear here.</p>
                      <p className="text-sm opacity-60">Upload a photo and hit Generate to start.</p>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#121214] rounded-xl border border-white/5">
                <h3 className="text-cyan-400 font-medium mb-1 text-sm">Pro Tip 1</h3>
                <p className="text-xs text-gray-400">Use a high-contrast headshot with good lighting for best results.</p>
              </div>
              <div className="p-4 bg-[#121214] rounded-xl border border-white/5">
                <h3 className="text-pink-400 font-medium mb-1 text-sm">Pro Tip 2</h3>
                <p className="text-xs text-gray-400">Keep titles short (under 5 words) for maximum readability.</p>
              </div>
              <div className="p-4 bg-[#121214] rounded-xl border border-white/5">
                <h3 className="text-purple-400 font-medium mb-1 text-sm">Pro Tip 3</h3>
                <p className="text-xs text-gray-400">Try different themes if the text doesn't pop enough.</p>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ThumbnailGenerator;