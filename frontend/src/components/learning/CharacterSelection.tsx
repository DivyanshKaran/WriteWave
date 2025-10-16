"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, Star, Clock, Target, BookOpen, Zap, CheckCircle, Play, RotateCcw } from 'lucide-react';
import { useCharacterStore } from '@/stores/characterStore';
import type { Character, CharacterType, CharacterDifficulty } from '@/types/character';

interface CharacterSelectionProps {
  onCharacterSelect: (character: Character) => void;
  className?: string;
}

interface FilterState {
  type: 'all' | CharacterType;
  difficulty: 'all' | CharacterDifficulty;
  mastery: 'all' | 'new' | 'learning' | 'mastered';
  search: string;
  sortBy: 'alphabetical' | 'difficulty' | 'mastery' | 'frequency';
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({ 
  onCharacterSelect, 
  className = '' 
}) => {
  const { 
    characters, 
    characterMastery, 
    isLoading, 
    loadCharacters,
    setCharacterType,
    setCharacterDifficulty,
    setSearchQuery,
    getFilteredCharacters
  } = useCharacterStore();

  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    difficulty: 'all',
    mastery: 'all',
    search: '',
    sortBy: 'alphabetical'
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const filteredCharacters = useMemo(() => {
    let filtered = characters;

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(char => char.type === filters.type);
    }

    // Filter by difficulty
    if (filters.difficulty !== 'all') {
      const difficultyMap: Record<string, number> = {
        beginner: 1,
        intermediate: 2,
        advanced: 3,
        expert: 4,
        master: 5
      };
      filtered = filtered.filter(char => char.difficulty === difficultyMap[filters.difficulty]);
    }

    // Filter by mastery
    if (filters.mastery !== 'all') {
      filtered = filtered.filter(char => {
        const mastery = characterMastery[char.id];
        if (!mastery) return filters.mastery === 'new';
        if (mastery.mastery < 30) return filters.mastery === 'new';
        if (mastery.mastery < 80) return filters.mastery === 'learning';
        return filters.mastery === 'mastered';
      });
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(char =>
        char.character.includes(query) ||
        char.readings.some(reading => reading.toLowerCase().includes(query)) ||
        char.meanings.some(meaning => meaning.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'alphabetical':
          return a.character.localeCompare(b.character);
        case 'difficulty':
          return a.difficulty - b.difficulty;
        case 'mastery':
          const masteryA = characterMastery[a.id]?.mastery || 0;
          const masteryB = characterMastery[b.id]?.mastery || 0;
          return masteryB - masteryA;
        case 'frequency':
          // Mock frequency data
          return Math.random() - 0.5;
        default:
          return 0;
      }
    });

    return filtered;
  }, [characters, characterMastery, filters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
    onCharacterSelect(character);
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-green-600 bg-green-50';
    if (mastery >= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getMasteryText = (mastery: number) => {
    if (mastery >= 80) return 'Mastered';
    if (mastery >= 30) return 'Learning';
    return 'New';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 1) return 'text-green-600 bg-green-50';
    if (difficulty <= 2) return 'text-yellow-600 bg-yellow-50';
    if (difficulty <= 3) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 1) return 'Beginner';
    if (difficulty <= 2) return 'Intermediate';
    if (difficulty <= 3) return 'Advanced';
    if (difficulty <= 4) return 'Expert';
    return 'Master';
  };

  const getTypeColor = (type: CharacterType) => {
    switch (type) {
      case 'hiragana': return 'text-blue-600 bg-blue-50';
      case 'katakana': return 'text-purple-600 bg-purple-50';
      case 'kanji': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading characters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-2xl font-bold text-gray-900">Character Library</h2>
          <p className="body text-gray-600">
            {filteredCharacters.length} characters available
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border-base rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search characters, readings, or meanings..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-base rounded-lg p-6 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Character Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="hiragana">Hiragana</option>
                  <option value="katakana">Katakana</option>
                  <option value="kanji">Kanji</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                  <option value="master">Master</option>
                </select>
              </div>

              {/* Mastery Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mastery Level</label>
                <select
                  value={filters.mastery}
                  onChange={(e) => handleFilterChange('mastery', e.target.value)}
                  className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="new">New Characters</option>
                  <option value="learning">Learning</option>
                  <option value="mastered">Mastered</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-2 border-base rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="alphabetical">Alphabetical</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="mastery">Mastery Level</option>
                  <option value="frequency">Frequency</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({
                  type: 'all',
                  difficulty: 'all',
                  mastery: 'all',
                  search: '',
                  sortBy: 'alphabetical'
                })}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Filters</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-3'}>
        <AnimatePresence>
          {filteredCharacters.map((character, index) => {
            const mastery = characterMastery[character.id];
            const masteryLevel = mastery?.mastery || 0;
            
            return (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className={`cursor-pointer group ${
                  viewMode === 'grid' 
                    ? 'aspect-square' 
                    : 'flex items-center space-x-4 p-4 border-base rounded-lg hover:border-primary hover:bg-primary/5'
                }`}
                onClick={() => handleCharacterClick(character)}
              >
                {viewMode === 'grid' ? (
                  <div className="relative w-full h-full border-base rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-all group-hover:shadow-lg">
                    {/* Character */}
                    <div className="text-center space-y-2">
                      <div className="text-4xl font-bold text-primary group-hover:scale-110 transition-transform">
                        {character.character}
                      </div>
                      
                      {/* Type Badge */}
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(character.type)}`}>
                        {character.type.charAt(0).toUpperCase() + character.type.slice(1)}
                      </div>
                    </div>

                    {/* Mastery Indicator */}
                    {mastery && (
                      <div className="absolute top-2 right-2">
                        <div className={`w-3 h-3 rounded-full ${
                          masteryLevel >= 80 ? 'bg-green-500' : 
                          masteryLevel >= 30 ? 'bg-yellow-500' : 'bg-gray-300'
                        }`} />
                      </div>
                    )}

                    {/* Difficulty Indicator */}
                    <div className="absolute bottom-2 left-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(character.difficulty)}`}>
                        {getDifficultyText(character.difficulty)}
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                      <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 w-full">
                    <div className="text-3xl font-bold text-primary">
                      {character.character}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(character.type)}`}>
                          {character.type}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(character.difficulty)}`}>
                          {getDifficultyText(character.difficulty)}
                        </div>
                        {mastery && (
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMasteryColor(masteryLevel)}`}>
                            {getMasteryText(masteryLevel)}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div>Readings: {character.readings.join(', ')}</div>
                        <div>Meanings: {character.meanings.join(', ')}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {mastery && (
                        <div className="text-right">
                          <div className="text-sm font-medium">{masteryLevel}%</div>
                          <div className="text-xs text-gray-500">mastery</div>
                        </div>
                      )}
                      <Play className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredCharacters.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="heading text-xl font-semibold text-gray-900 mb-2">No characters found</h3>
          <p className="body text-gray-600 mb-4">
            Try adjusting your filters or search terms
          </p>
          <button
            onClick={() => setFilters({
              type: 'all',
              difficulty: 'all',
              mastery: 'all',
              search: '',
              sortBy: 'alphabetical'
            })}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
          <Star className="w-4 h-4" />
          <span>Practice New Characters</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
          <RotateCcw className="w-4 h-4" />
          <span>Review Learned</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
          <Target className="w-4 h-4" />
          <span>Focus on Difficult</span>
        </button>
      </div>
    </div>
  );
};
