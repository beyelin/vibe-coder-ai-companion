import React, { useState } from 'react';
import { Send, Copy, RefreshCw, Sparkles } from 'lucide-react';
import { generateSmartReply } from '../services/geminiService';
import type { SmartReplyRequest, SmartReplyResponse } from '../types';

const SmartReplyPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [style, setStyle] = useState<'humorous' | 'witty' | 'diplomatic'>('humorous');
  const [responses, setResponses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confidence, setConfidence] = useState<number>(0);

  const styleOptions = [
    { value: 'humorous', label: '幽默风趣', emoji: '😄' },
    { value: 'witty', label: '机智巧妙', emoji: '🧠' },
    { value: 'diplomatic', label: '外交得体', emoji: '🤝' }
  ];

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const request: SmartReplyRequest = {
        input: input.trim(),
        context: context.trim(),
        style
      };

      const result: SmartReplyResponse = await generateSmartReply(request);
      
      if (result.success) {
        setResponses(result.responses);
        setConfidence(result.confidence);
      } else {
        setResponses(result.responses);
        setConfidence(0);
      }
    } catch (error) {
      console.error('生成回应失败:', error);
      setResponses(['抱歉，AI助手暂时无法生成回应，请稍后再试。']);
      setConfidence(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加一个简单的提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 输入区域 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            遇到的话语 *
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你遇到的话语，比如：'你怎么又迟到了？'"
            className="w-full h-24 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            场景背景（可选）
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="比如：朋友聚会、工作会议、家庭聚餐等"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 风格选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            回应风格
          </label>
          <div className="flex gap-2">
            {styleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStyle(option.value as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    style === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                <span>{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={!input.trim() || isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              AI正在思考中...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              生成高情商回应
            </>
          )}
        </button>
      </div>

      {/* 结果展示区域 */}
      {responses.length > 0 && (
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              AI生成的回应建议
            </h3>
            {confidence > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>置信度:</span>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all duration-500"
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                  <span>{Math.round(confidence * 100)}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {responses.map((response, index) => (
              <div
                key={index}
                className="p-4 bg-gray-800 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-white flex-1 leading-relaxed">
                    {response}
                  </p>
                  <button
                    onClick={() => handleCopy(response)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-all"
                    title="复制到剪贴板"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用提示 */}
      {responses.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 space-y-2">
            <Sparkles size={48} className="mx-auto text-gray-600" />
            <p className="text-lg font-medium">机智接话助手</p>
            <p className="text-sm max-w-md">
              输入你遇到的话语，AI将为你生成高情商的幽默回应，
              让你在任何场合都能从容应对。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartReplyPanel;