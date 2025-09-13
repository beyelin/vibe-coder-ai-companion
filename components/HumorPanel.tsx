import React, { useState } from 'react';
import { MessageCircle, Briefcase, Quote, BookOpen } from 'lucide-react';
import type { HumorTab } from '../types';
import SmartReplyPanel from './SmartReplyPanel';
import WorkplacePanel from './WorkplacePanel';
import DailyQuotePanel from './DailyQuotePanel';
import PhraseLibraryPanel from './PhraseLibraryPanel';

const HumorPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HumorTab>('smart-reply');

  const tabs = [
    {
      id: 'smart-reply' as HumorTab,
      label: '机智接话',
      icon: MessageCircle,
      description: '高情商幽默回应生成器'
    },
    {
      id: 'workplace' as HumorTab,
      label: '职场回应',
      icon: Briefcase,
      description: '委婉幽默的职场沟通'
    },
    {
      id: 'daily-quote' as HumorTab,
      label: '每日语录',
      icon: Quote,
      description: '机智语录每日推送'
    },
    {
      id: 'phrase-library' as HumorTab,
      label: '话术库',
      icon: BookOpen,
      description: '万能话术快速选择'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'smart-reply':
        return <SmartReplyPanel />;
      case 'workplace':
        return <WorkplacePanel />;
      case 'daily-quote':
        return <DailyQuotePanel />;
      case 'phrase-library':
        return <PhraseLibraryPanel />;
      default:
        return <SmartReplyPanel />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* 标题区域 */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-2">
          情商+幽默回应助手
        </h2>
        <p className="text-gray-400">
          让每一次对话都充满智慧与幽默
        </p>
      </div>

      {/* 导航标签 */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }
              `}
              title={tab.description}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

      {/* 底部提示 */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            当前面板：{tabs.find(tab => tab.id === activeTab)?.description}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            AI 助手在线
          </span>
        </div>
      </div>
    </div>
  );
};

export { HumorPanel };