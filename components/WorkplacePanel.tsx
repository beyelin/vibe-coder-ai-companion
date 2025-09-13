import React, { useState } from 'react';
import { Send, Copy, RefreshCw, Briefcase, Clock, MessageSquare, FileText } from 'lucide-react';
import { generateWorkplaceReply } from '../services/geminiService';
import type { WorkplaceReplyRequest, SmartReplyResponse } from '../types';

const WorkplacePanel: React.FC = () => {
  const [input, setInput] = useState('');
  const [scenario, setScenario] = useState<'meeting' | 'deadline' | 'feedback' | 'request'>('meeting');
  const [tone, setTone] = useState<'diplomatic' | 'humorous' | 'professional'>('diplomatic');
  const [responses, setResponses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confidence, setConfidence] = useState<number>(0);

  const scenarioOptions = [
    { value: 'meeting', label: '会议场景', icon: MessageSquare, color: 'blue' },
    { value: 'deadline', label: '截止日期', icon: Clock, color: 'orange' },
    { value: 'feedback', label: '接受反馈', icon: FileText, color: 'green' },
    { value: 'request', label: '处理请求', icon: Briefcase, color: 'purple' }
  ];

  const toneOptions = [
    { value: 'diplomatic', label: '外交得体', emoji: '🤝', desc: '委婉而专业' },
    { value: 'humorous', label: '幽默化解', emoji: '😊', desc: '轻松化解尴尬' },
    { value: 'professional', label: '专业严谨', emoji: '💼', desc: '正式而礼貌' }
  ];

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const request: WorkplaceReplyRequest = {
        input: input.trim(),
        scenario,
        tone
      };

      const result: SmartReplyResponse = await generateWorkplaceReply(request);
      
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

  const getScenarioColor = (value: string) => {
    const option = scenarioOptions.find(opt => opt.value === value);
    return option?.color || 'blue';
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 输入区域 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            职场情况描述 *
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="描述你在职场中遇到的情况，比如：'这个项目进度有点慢啊'"
            className="w-full h-24 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 场景选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            职场场景
          </label>
          <div className="grid grid-cols-2 gap-2">
            {scenarioOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setScenario(option.value as any)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all
                    ${
                      scenario === option.value
                        ? `bg-${option.color}-600 text-white shadow-lg`
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  <Icon size={18} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 语调选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            回应语调
          </label>
          <div className="space-y-2">
            {toneOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors"
              >
                <input
                  type="radio"
                  name="tone"
                  value={option.value}
                  checked={tone === option.value}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-lg">{option.emoji}</span>
                <div className="flex-1">
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-gray-400 text-sm">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={!input.trim() || isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              AI正在分析职场情况...
            </>
          ) : (
            <>
              <Briefcase size={20} />
              生成职场回应
            </>
          )}
        </button>
      </div>

      {/* 结果展示区域 */}
      {responses.length > 0 && (
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              职场回应建议
            </h3>
            {confidence > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>适用度:</span>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
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
                  <div className="flex-1">
                    <p className="text-white leading-relaxed mb-2">
                      {response}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`px-2 py-1 bg-${getScenarioColor(scenario)}-600 text-white rounded`}>
                        {scenarioOptions.find(opt => opt.value === scenario)?.label}
                      </span>
                      <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded">
                        {toneOptions.find(opt => opt.value === tone)?.label}
                      </span>
                    </div>
                  </div>
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
            <Briefcase size={48} className="mx-auto text-gray-600" />
            <p className="text-lg font-medium">职场回应助手</p>
            <p className="text-sm max-w-md">
              描述你在职场中遇到的情况，AI将根据不同场景和语调，
              为你生成委婉而幽默的职场回应。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkplacePanel;