import React, { useState, useEffect } from 'react';
import { Search, Copy, Filter, Tag, TrendingUp, Heart } from 'lucide-react';
import { getPhraseLibrary } from '../services/geminiService';
import type { PhraseItem, PhraseCategory } from '../types';

const PhraseLibraryPanel: React.FC = () => {
  const [phrases, setPhrases] = useState<PhraseItem[]>([]);
  const [filteredPhrases, setFilteredPhrases] = useState<PhraseItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PhraseCategory | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories: { value: PhraseCategory | 'all'; label: string; color: string }[] = [
    { value: 'all', label: '全部', color: 'gray' },
    { value: '赞美型', label: '赞美型', color: 'blue' },
    { value: '打圆场', label: '打圆场', color: 'green' },
    { value: '自黑型', label: '自黑型', color: 'purple' },
    { value: '委婉拒绝', label: '委婉拒绝', color: 'orange' },
    { value: '幽默化解', label: '幽默化解', color: 'pink' }
  ];

  // 初始化数据
  useEffect(() => {
    const libraryData = getPhraseLibrary();
    
    // 从localStorage加载使用次数和收藏
    const savedUsage = localStorage.getItem('phraseUsage');
    const savedFavorites = localStorage.getItem('phraseFavorites');
    
    if (savedUsage) {
      const usageData = JSON.parse(savedUsage);
      libraryData.forEach(phrase => {
        if (usageData[phrase.id]) {
          phrase.usageCount = usageData[phrase.id];
        }
      });
    }
    
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    
    setPhrases(libraryData);
    setFilteredPhrases(libraryData);
  }, []);

  // 过滤逻辑
  useEffect(() => {
    let filtered = phrases;
    
    // 按分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(phrase => phrase.category === selectedCategory);
    }
    
    // 按标签过滤
    if (selectedTag) {
      filtered = filtered.filter(phrase => phrase.tags.includes(selectedTag));
    }
    
    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(phrase => 
        phrase.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phrase.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phrase.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredPhrases(filtered);
  }, [phrases, selectedCategory, selectedTag, searchTerm]);

  // 保存使用次数到localStorage
  const saveUsageData = (updatedPhrases: PhraseItem[]) => {
    const usageData: Record<string, number> = {};
    updatedPhrases.forEach(phrase => {
      usageData[phrase.id] = phrase.usageCount;
    });
    localStorage.setItem('phraseUsage', JSON.stringify(usageData));
  };

  // 保存收藏到localStorage
  const saveFavorites = (favs: Set<string>) => {
    localStorage.setItem('phraseFavorites', JSON.stringify(Array.from(favs)));
  };

  const handleCopyPhrase = async (phrase: PhraseItem) => {
    try {
      await navigator.clipboard.writeText(phrase.content);
      
      // 增加使用次数
      const updatedPhrases = phrases.map(p => 
        p.id === phrase.id ? { ...p, usageCount: p.usageCount + 1 } : p
      );
      setPhrases(updatedPhrases);
      saveUsageData(updatedPhrases);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const toggleFavorite = (phraseId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(phraseId)) {
      newFavorites.delete(phraseId);
    } else {
      newFavorites.add(phraseId);
    }
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const getAllTags = () => {
    const allTags = new Set<string>();
    phrases.forEach(phrase => {
      phrase.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  };

  const getCategoryColor = (category: string) => {
    const categoryInfo = categories.find(c => c.value === category);
    return categoryInfo?.color || 'gray';
  };

  const getMostUsedPhrases = () => {
    return [...phrases]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 3)
      .filter(p => p.usageCount > 0);
  };

  const mostUsedPhrases = getMostUsedPhrases();

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 搜索和过滤区域 */}
      <div className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索话术内容、分类或标签..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 分类过滤 */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${
                  selectedCategory === category.value
                    ? `bg-${category.color}-600 text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* 标签过滤 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm text-gray-400">标签:</span>
          {getAllTags().map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
              className={`
                flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors
                ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              <Tag size={12} />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 热门话术 */}
      {mostUsedPhrases.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-orange-500" />
            <h3 className="text-lg font-semibold text-white">热门话术</h3>
          </div>
          <div className="grid gap-2">
            {mostUsedPhrases.map((phrase) => (
              <div
                key={phrase.id}
                className="p-3 bg-gradient-to-r from-orange-900 to-red-900 border border-orange-600 rounded-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-white text-sm flex-1">{phrase.content}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-orange-300">
                      {phrase.usageCount}次
                    </span>
                    <button
                      onClick={() => handleCopyPhrase(phrase)}
                      className="p-1 text-orange-300 hover:text-white transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 话术列表 */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            话术库
          </h3>
          <span className="text-sm text-gray-400">
            共 {filteredPhrases.length} 条话术
          </span>
        </div>

        {filteredPhrases.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredPhrases.map((phrase) => (
              <div
                key={phrase.id}
                className="p-4 bg-gray-800 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-white leading-relaxed flex-1">
                    {phrase.content}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(phrase.id)}
                      className={`p-2 rounded transition-colors ${
                        favorites.has(phrase.id)
                          ? 'text-red-500 bg-red-500 bg-opacity-20'
                          : 'text-gray-400 hover:text-red-500 hover:bg-gray-700'
                      }`}
                      title={favorites.has(phrase.id) ? '取消收藏' : '收藏话术'}
                    >
                      <Heart size={16} fill={favorites.has(phrase.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleCopyPhrase(phrase)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      title="复制话术"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 bg-${getCategoryColor(phrase.category)}-600 text-white text-xs rounded`}>
                      {phrase.category}
                    </span>
                    {phrase.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {phrase.usageCount > 0 && (
                    <span className="text-xs text-gray-500">
                      使用 {phrase.usageCount} 次
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500 space-y-2">
              <Search size={48} className="mx-auto text-gray-600" />
              <p className="text-lg font-medium">未找到匹配的话术</p>
              <p className="text-sm">尝试调整搜索条件或选择其他分类</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhraseLibraryPanel;