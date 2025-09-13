
import React from 'react';
import { CodeDisplay } from './CodeDisplay';
import { HumorPanel } from './HumorPanel';
import type { ActiveTab } from '../types';

interface CodePreviewPanelProps {
  code: string;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const CodePreviewPanel: React.FC<CodePreviewPanelProps> = ({ code, activeTab, onTabChange }) => {

  const getTabClass = (tabName: ActiveTab): string => {
    return activeTab === tabName
      ? 'bg-indigo-600 text-white'
      : 'bg-gray-800 text-gray-300 hover:bg-gray-700';
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg p-4">
      <div className="flex mb-4">
        <button
          onClick={() => onTabChange('code')}
          className={`px-4 py-2 rounded-l-md font-semibold transition-colors ${getTabClass('code')}`}
        >
          代码
        </button>
        <button
          onClick={() => onTabChange('preview')}
          className={`px-4 py-2 font-semibold transition-colors ${getTabClass('preview')}`}
        >
          预览
        </button>
        <button
          onClick={() => onTabChange('humor')}
          className={`px-4 py-2 rounded-r-md font-semibold transition-colors ${getTabClass('humor')}`}
        >
          情商助手
        </button>
      </div>
      <div className="flex-grow rounded-md overflow-hidden bg-gray-900">
        {activeTab === 'code' && (
          code ? <CodeDisplay code={code} /> : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>代码生成后将显示在此处...</p>
            </div>
          )
        )}
        {activeTab === 'preview' && (
           code ? (
            <iframe
              srcDoc={code}
              title="Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>应用预览将在此处实时渲染...</p>
            </div>
          )
        )}
        {activeTab === 'humor' && (
          <div className="w-full h-full">
            <HumorPanel />
          </div>
        )}
      </div>
    </div>
  );
};
