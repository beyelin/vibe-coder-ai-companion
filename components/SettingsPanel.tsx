
import React, { useState } from 'react';
import { WallpaperIcon, PlayIcon, PauseIcon, PresentationIcon } from './Icons';

interface SettingsPanelProps {
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  onGenerateWallpaper: (prompt: string) => void;
  onRemoveWallpaper: () => void;
  isGeneratingWallpaper: boolean;
  onStartDemo: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isMusicPlaying,
  onToggleMusic,
  onGenerateWallpaper,
  onRemoveWallpaper,
  isGeneratingWallpaper,
  onStartDemo,
}) => {
  const [prompt, setPrompt] = useState('');

  const handleGenerateClick = () => {
    if (prompt.trim() && !isGeneratingWallpaper) {
      onGenerateWallpaper(prompt);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerateClick();
    }
  };
  
  return (
    <div className="bg-gray-800/60 rounded-lg p-3 flex items-center justify-between gap-6 backdrop-blur-sm shadow-lg w-full text-sm">
        <div className="flex items-center gap-4">
            <h3 className="font-bold text-cyan-300 text-base flex-shrink-0">Vibe 控制台</h3>
            <button
                onClick={onStartDemo}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-1.5 px-3 rounded-md transition-colors flex items-center gap-2"
            >
                <PresentationIcon className="w-4 h-4" />
                项目演示
            </button>
        </div>
        
        <div className="flex items-center gap-2 flex-grow justify-center max-w-lg">
            <label htmlFor="wallpaper-prompt" className="text-gray-300 font-semibold flex-shrink-0">AI 壁纸:</label>
            <input
                id="wallpaper-prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="例如: 宁静的赛博朋克雨夜"
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                disabled={isGeneratingWallpaper}
            />
            <button
                onClick={handleGenerateClick}
                disabled={isGeneratingWallpaper || !prompt.trim()}
                className="bg-indigo-600 rounded-md p-2 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors flex-shrink-0"
                aria-label="Generate Wallpaper"
            >
                {isGeneratingWallpaper ? 
                <span className="w-5 h-5 block border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                : <WallpaperIcon className="w-5 h-5 text-white" />
                }
            </button>
            <button
                onClick={onRemoveWallpaper}
                className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold py-1.5 px-3 rounded-md transition-colors flex-shrink-0"
            >
                移除
            </button>
        </div>
        
        <div className="border-l border-gray-600 h-8"></div>

        <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-gray-300 font-semibold">背景音乐</span>
            <button
                onClick={onToggleMusic}
                className="bg-indigo-600 rounded-full w-10 h-10 flex items-center justify-center hover:bg-indigo-700 transition-colors"
                aria-label={isMusicPlaying ? "Pause Music" : "Play Music"}
            >
                {isMusicPlaying ? <PauseIcon className="w-5 h-5 text-white" /> : <PlayIcon className="w-5 h-5 text-white" />}
            </button>
        </div>
    </div>
  );
};
