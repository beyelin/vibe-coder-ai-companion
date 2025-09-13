import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { Author } from '../types';
import { BotIcon, SendIcon } from './Icons';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  companionAvatar: string;
}

const SuggestionBox: React.FC<{ onSelect: (text: string) => void }> = ({ onSelect }) => (
  <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-md shadow-lg overflow-hidden">
    <button
      onClick={() => onSelect('@AI伙伴 ')}
      className="w-full text-left px-4 py-2 text-white hover:bg-indigo-600 transition-colors"
    >
      <span className="font-bold">@AI伙伴</span>
      <span className="text-gray-400 ml-2">- 与您的 AI 伙伴聊天</span>
    </button>
  </div>
);

const demoPrompts = [
  "创建一个简单的番茄钟",
  "构建一个 Markdown 预览器",
  "生成一个待办事项列表应用",
];

const DemoPrompts: React.FC<{ onSelect: (prompt: string) => void }> = ({ onSelect }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-4">
     <h2 className="text-lg font-semibold mb-2 text-gray-300">开始您的创造之旅</h2>
     <p className="mb-4 text-sm">试试这些想法，或在下方输入您自己的需求：</p>
     <div className="flex flex-wrap justify-center gap-2">
       {demoPrompts.map(prompt => (
         <button 
            key={prompt} 
            onClick={() => onSelect(prompt)} 
            className="bg-gray-700 hover:bg-indigo-600 text-white text-xs font-semibold py-2 px-3 rounded-full transition-all duration-200 ease-in-out"
         >
           {prompt}
         </button>
       ))}
     </div>
  </div>
);

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading, companionAvatar }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.endsWith('@'));
  };
  
  const handleSuggestionSelect = (text: string) => {
    setInputValue(text);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const getAvatar = (author: Author, avatar: string) => {
    switch (author) {
      case Author.BOT:
        return avatar ? <img src={avatar} alt="Bot" className="w-8 h-8 rounded-full object-cover" /> : <BotIcon className="w-8 h-8 text-gray-400" />;
      case Author.COMPANION:
        return <img src={avatar} alt="Companion" className="w-8 h-8 rounded-full object-cover" />;
      case Author.USER:
        return null;
    }
  };

  const getBubbleClass = (author: Author) => {
    switch (author) {
      case Author.USER:
        return 'bg-indigo-600 self-end';
      case Author.BOT:
        return 'bg-gray-700 self-start';
      case Author.COMPANION:
        return 'bg-cyan-800/50 self-start backdrop-blur-sm';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
      <h1 className="text-xl font-bold text-center text-cyan-300 mb-4">Vibe Coder AI 伙伴</h1>
      <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4">
        {messages.length === 0 && !isLoading && <DemoPrompts onSelect={onSendMessage} />}
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 max-w-[85%] ${msg.author === Author.USER ? 'self-end flex-row-reverse' : 'self-start'}`}>
            {getAvatar(msg.author, msg.avatar) && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center">
                  {getAvatar(msg.author, msg.avatar)}
              </div>
            )}
            <div className={`rounded-lg px-4 py-2 text-white ${getBubbleClass(msg.author)}`}>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 self-start">
             <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center">
                <BotIcon className="w-8 h-8 text-gray-400" />
            </div>
            <div className="rounded-lg px-4 py-2 bg-gray-700 text-white flex items-center space-x-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="relative">
        {showSuggestions && <SuggestionBox onSelect={handleSuggestionSelect} />}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          disabled={isLoading}
          placeholder="输入您的开发需求, 或用 @AI伙伴 聊天..."
          className="w-full bg-gray-700 border border-gray-600 rounded-full pl-4 pr-12 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 rounded-full p-2 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
        >
          <SendIcon className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
};