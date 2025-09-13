
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Message, ActiveTab } from './types';
import { Author, CompanionState } from './types';
import { ChatPanel } from './components/ChatPanel';
import { CompanionPanel } from './components/CompanionPanel';
import { CodePreviewPanel } from './components/CodePreviewPanel';
import { generateCode, chatWithCompanion, generateWallpaper } from './services/geminiService';
import { useCompanionImage } from './hooks/useCompanionImage';
import { useWallpaper } from './hooks/useWallpaper';
import { DefaultCompanion } from './components/DefaultCompanion'; 
import ReactDOMServer from 'react-dom/server';
import { SettingsPanel } from './components/SettingsPanel';
import { demoData } from './demoData';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [companionState, setCompanionState] = useState<CompanionState>(CompanionState.IDLE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [companionImage, ] = useCompanionImage();
  
  const [wallpaper, setWallpaper] = useWallpaper();
  const [isGeneratingWallpaper, setIsGeneratingWallpaper] = useState(false);
  
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');


  const getDefaultCompanionAvatar = () => {
    const svgString = ReactDOMServer.renderToStaticMarkup(<DefaultCompanion />);
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  };
  
  const [companionAvatar, setCompanionAvatar] = useState(getDefaultCompanionAvatar());

  useEffect(() => {
    setCompanionAvatar(companionImage || getDefaultCompanionAvatar());
  }, [companionImage]);


  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = { author: Author.USER, content, avatar: companionAvatar };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    if (content.trim().startsWith('@AI伙伴')) {
      const companionPrompt = content.replace('@AI伙伴', '').trim();
      setCompanionState(CompanionState.THINKING);
      const companionResponse = await chatWithCompanion(companionPrompt);
      const companionMessage: Message = { author: Author.COMPANION, content: companionResponse, avatar: companionAvatar };
      setMessages(prev => [...prev, companionMessage]);
      setCompanionState(CompanionState.HAPPY);
    } else {
      setCompanionState(CompanionState.THINKING);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCompanionState(CompanionState.WORKING);
      
      const result = await generateCode(content);

      const botMessage: Message = { author: Author.BOT, content: result.explanation, avatar: companionAvatar };
      setMessages(prev => [...prev, botMessage]);
      setGeneratedCode(result.code);
      setCompanionState(CompanionState.HAPPY);
    }
    
    setIsLoading(false);
    setTimeout(() => setCompanionState(CompanionState.IDLE), 2000); 
  }, [companionAvatar]);

  const handleToggleMusic = useCallback(async () => {
    if (!audioRef.current || audioError) {
      if (audioError) {
        console.log('Audio is disabled due to loading errors');
      }
      return;
    }
    
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsMusicPlaying(true);
      } catch (error) {
        console.error("Audio play failed:", error);
        setIsMusicPlaying(false);
        setAudioError(true);
        // Show user-friendly error message
        console.log('Background music is not available in this environment.');
      }
    }
  }, [isMusicPlaying, audioError]);

  const handleGenerateWallpaper = useCallback(async (prompt: string) => {
    setIsGeneratingWallpaper(true);
    try {
      const imageUrl = await generateWallpaper(prompt);
      setWallpaper(imageUrl);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { author: Author.BOT, content: `抱歉，壁纸生成失败了：${(error as Error).message}`, avatar: companionAvatar };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGeneratingWallpaper(false);
    }
  }, [setWallpaper, companionAvatar]);

  const handleRemoveWallpaper = useCallback(() => {
    setWallpaper(null);
  }, [setWallpaper]);

  const handleStartDemo = useCallback(() => {
    if (isLoading) return;

    // 1. Reset state
    setMessages([]);
    setGeneratedCode('');
    setActiveTab('preview');
    setIsLoading(true);

    // 2. Add user message
    const demoPrompt = "为我准备一份可编辑的项目需求文档用于演示";
    const userMessage: Message = { author: Author.USER, content: demoPrompt, avatar: companionAvatar };
    setMessages([userMessage]);

    // 3. Companion thinking
    setCompanionState(CompanionState.THINKING);

    setTimeout(() => {
      // 4. Companion working
      setCompanionState(CompanionState.WORKING);

      setTimeout(() => {
        // 5. Show results
        const botMessage: Message = { author: Author.BOT, content: demoData.explanation, avatar: companionAvatar };
        setMessages(prev => [...prev, botMessage]);
        setGeneratedCode(demoData.code);
        setActiveTab('preview'); // Ensure preview is active
        setCompanionState(CompanionState.HAPPY);
        setIsLoading(false);

        // 6. Reset companion state after a delay
        setTimeout(() => setCompanionState(CompanionState.IDLE), 2000);
      }, 2500); // Simulate work time
    }, 1500); // Simulate thinking time
  }, [isLoading, companionAvatar]);

  return (
    <main 
      className="h-screen w-screen p-4 flex flex-col gap-4 text-gray-200 bg-gray-900 bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: wallpaper ? `url(${wallpaper})` : 'none' }}
    >
      <audio 
        ref={audioRef}
        loop 
        preload="metadata"
        onError={(e) => {
          console.error('Audio loading error:', e);
          setIsMusicPlaying(false);
          setAudioError(true);
        }}
        onLoadStart={() => console.log('Audio loading started')}
        onCanPlay={() => console.log('Audio can play')}
        onLoadedData={() => console.log('Audio data loaded')}
      >
        <source src="/background-music.mp3" type="audio/mpeg" />
        <source src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
      
      {/* Main Content Area */}
      <div className="flex-grow flex gap-4 min-h-0">
        
        {/* Left Column (Chat) */}
        <div className="w-1/3 h-full">
          <ChatPanel 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            companionAvatar={companionAvatar}
          />
        </div>
        
        {/* Right Column (Code Preview + Companion) */}
        <div className="w-2/3 h-full relative">
          <CodePreviewPanel 
            code={generatedCode}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <div className="absolute bottom-4 right-4 z-10">
            <CompanionPanel state={companionState} />
          </div>
        </div>
      </div>

      {/* Bottom Bar (Vibe Console) */}
      <div className="flex-shrink-0">
        <SettingsPanel 
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={handleToggleMusic}
          onGenerateWallpaper={handleGenerateWallpaper}
          onRemoveWallpaper={handleRemoveWallpaper}
          isGeneratingWallpaper={isGeneratingWallpaper}
          onStartDemo={handleStartDemo}
        />
      </div>
    </main>
  );
};

export default App;