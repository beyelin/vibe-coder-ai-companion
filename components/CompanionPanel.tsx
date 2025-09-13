
import React, { useRef } from 'react';
import { useCompanionImage } from '../hooks/useCompanionImage';
import { CompanionState } from '../types';
import { DefaultCompanion } from './DefaultCompanion';

interface CompanionPanelProps {
  state: CompanionState;
}

const stateInfo: Record<CompanionState, { text: string; glowClass: string }> = {
  [CompanionState.IDLE]: { text: '等待指令中...', glowClass: 'shadow-none ring-gray-700 hover:ring-cyan-500/50' },
  [CompanionState.THINKING]: { text: '脑筋转转转...', glowClass: 'ring-cyan-500/80 shadow-cyan-500/60 animate-pulse' },
  [CompanionState.WORKING]: { text: '代码精灵正在变身！✨', glowClass: 'ring-yellow-400/80 shadow-yellow-400/60 animate-pulse [animation-duration:1s]' },
  [CompanionState.HAPPY]: { text: '锵锵~ 完成！🎉', glowClass: 'ring-green-500/90 shadow-green-500/70 animate-pulse [animation-iteration-count:4]' },
};

export const CompanionPanel: React.FC<CompanionPanelProps> = ({ state }) => {
  const [customImage, setCustomImage] = useCompanionImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCustomImage(null);
  };

  const currentStatus = stateInfo[state];
  const commonRingClasses = 'ring-2 transition-all duration-500 ease-in-out shadow-xl';

  return (
    <div className="bg-gray-800/60 rounded-lg p-2 flex items-center gap-3 backdrop-blur-sm shadow-2xl">
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 flex-shrink-0 ${commonRingClasses} ${currentStatus.glowClass}`}
        style={{ perspective: '600px' }}
      >
        {customImage ? (
          <img
            src={customImage}
            alt="AI Companion"
            className="w-full h-full object-cover"
            style={{ transform: 'scale(1.1)' }}
          />
        ) : (
          <DefaultCompanion />
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        <p className="text-cyan-300 text-sm h-5 font-semibold">{currentStatus.text}</p>
        <div className="flex space-x-2">
            <button
                onClick={handleUploadClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1 px-3 rounded-full transition-colors"
            >
                上传
            </button>
            {customImage && (
                <button
                    onClick={handleRemoveImage}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold py-1 px-3 rounded-full transition-colors"
                >
                    移除
                </button>
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
      </div>
    </div>
  );
};
