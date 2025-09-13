import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy, Calendar, Share2, Heart, Quote as QuoteIcon } from 'lucide-react';
import { generateDailyQuote } from '../services/geminiService';
import type { DailyQuote } from '../types';

const DailyQuotePanel: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<DailyQuote | null>(null);
  const [quoteHistory, setQuoteHistory] = useState<DailyQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 从localStorage加载数据
  useEffect(() => {
    const savedQuote = localStorage.getItem('dailyQuote');
    const savedHistory = localStorage.getItem('quoteHistory');
    const savedFavorites = localStorage.getItem('quoteFavorites');
    
    if (savedQuote) {
      const quote = JSON.parse(savedQuote);
      // 检查是否是今天的语录
      if (quote.date === new Date().toISOString().split('T')[0]) {
        setCurrentQuote(quote);
      }
    }
    
    if (savedHistory) {
      setQuoteHistory(JSON.parse(savedHistory));
    }
    
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    
    // 如果没有今天的语录，自动生成一条
    if (!savedQuote || JSON.parse(savedQuote).date !== new Date().toISOString().split('T')[0]) {
      handleGenerateQuote();
    }
  }, []);

  // 保存到localStorage
  const saveToStorage = (quote: DailyQuote, history: DailyQuote[]) => {
    localStorage.setItem('dailyQuote', JSON.stringify(quote));
    localStorage.setItem('quoteHistory', JSON.stringify(history));
  };

  const saveFavorites = (favs: Set<string>) => {
    localStorage.setItem('quoteFavorites', JSON.stringify(Array.from(favs)));
  };

  const handleGenerateQuote = async () => {
    setIsLoading(true);
    try {
      const newQuote = await generateDailyQuote();
      setCurrentQuote(newQuote);
      
      // 更新历史记录
      const updatedHistory = [newQuote, ...quoteHistory.filter(q => q.date !== newQuote.date)].slice(0, 30);
      setQuoteHistory(updatedHistory);
      
      saveToStorage(newQuote, updatedHistory);
    } catch (error) {
      console.error('生成每日语录失败:', error);
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

  const handleShare = async (quote: DailyQuote) => {
    const shareText = `${quote.content}\n\n— 来自情商助手的每日语录`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '每日语录分享',
          text: shareText
        });
      } catch (error) {
        handleCopy(shareText);
      }
    } else {
      handleCopy(shareText);
    }
  };

  const toggleFavorite = (quoteId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(quoteId)) {
      newFavorites.delete(quoteId);
    } else {
      newFavorites.add(quoteId);
    }
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '生活智慧': 'bg-blue-600',
      '职场哲理': 'bg-purple-600',
      '人际关系': 'bg-green-600',
      '情商修养': 'bg-orange-600',
      '幽默人生': 'bg-pink-600'
    };
    return colors[category] || 'bg-gray-600';
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 今日语录卡片 */}
      {currentQuote && (
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-indigo-300" />
                <span className="text-indigo-300 text-sm font-medium">
                  {formatDate(currentQuote.date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 ${getCategoryColor(currentQuote.category)} text-white text-xs font-medium rounded-full`}>
                  {currentQuote.category}
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <QuoteIcon size={24} className="text-indigo-300 mb-3" />
              <p className="text-xl leading-relaxed font-medium">
                {currentQuote.content}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleFavorite(currentQuote.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favorites.has(currentQuote.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                  title={favorites.has(currentQuote.id) ? '取消收藏' : '收藏语录'}
                >
                  <Heart size={16} fill={favorites.has(currentQuote.id) ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => handleCopy(currentQuote.content)}
                  className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                  title="复制语录"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleShare(currentQuote)}
                  className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                  title="分享语录"
                >
                  <Share2 size={16} />
                </button>
              </div>
              
              <button
                onClick={handleGenerateQuote}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                {isLoading ? '生成中...' : '换一条'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 历史语录 */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            历史语录
          </h3>
          <span className="text-sm text-gray-400">
            共 {quoteHistory.length} 条
          </span>
        </div>

        {quoteHistory.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {quoteHistory.map((quote) => (
              <div
                key={quote.id}
                className="p-4 bg-gray-800 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-white leading-relaxed flex-1">
                    {quote.content}
                  </p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFavorite(quote.id)}
                      className={`p-1 rounded transition-colors ${
                        favorites.has(quote.id)
                          ? 'text-red-500'
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart size={14} fill={favorites.has(quote.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleCopy(quote.content)}
                      className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className={`px-2 py-1 ${getCategoryColor(quote.category)} text-white rounded`}>
                    {quote.category}
                  </span>
                  <span>{formatDate(quote.date)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500 space-y-2">
              <QuoteIcon size={48} className="mx-auto text-gray-600" />
              <p className="text-lg font-medium">暂无历史语录</p>
              <p className="text-sm">每天都会为你生成新的智慧语录</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyQuotePanel;