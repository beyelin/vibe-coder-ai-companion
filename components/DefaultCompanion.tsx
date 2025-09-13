
import React from 'react';

export const DefaultCompanion: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Static background rings */}
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(0, 255, 255, 0.1)" strokeWidth="1" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="1" />
        
        {/* Core sphere */}
        <defs>
          <radialGradient id="coreGradient" cx="0.4" cy="0.4" r="0.6">
            <stop offset="0%" stopColor="rgba(110, 231, 244, 1)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 1)" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="30" fill="url(#coreGradient)" />

        {/* Animated outer ring */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0, 255, 255, 0.5)" strokeWidth="2" strokeDasharray="10 15">
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 100 100"
            to="360 100 100"
            dur="20s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Animated inner particle */}
        <circle cx="100" cy="100" r="3">
          <animateMotion
            dur="8s"
            repeatCount="indefinite"
            path="M 100,50 A 50,50 0 1,1 100,150 A 50,50 0 1,1 100,50"
            rotate="auto"
          />
          <animate
            attributeName="fill"
            values="rgba(255,255,255,1);rgba(255,255,255,0.5);rgba(255,255,255,1)"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};
