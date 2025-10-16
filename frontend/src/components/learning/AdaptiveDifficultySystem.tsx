"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Brain, Zap, Clock, CheckCircle, AlertCircle, BarChart3, Lightbulb } from 'lucide-react';
import type { Character, CharacterRecognitionResult } from '@/types/character';

interface AdaptiveDifficultySystemProps {
  userId: string;
  currentCharacter: Character;
  onDifficultyAdjust: (adjustment: DifficultyAdjustment) => void;
  className?: string;
}

interface DifficultyAdjustment {
  characterId: string;
  newDifficulty: number;
  reason: string;
  confidence: number;
  timestamp: string;
}

interface UserPerformance {
  accuracy: number;
  speed: number;
  consistency: number;
  improvement: number;
  attempts: number;
  averageScore: number;
}

interface DifficultyMetrics {
  currentDifficulty: number;
  recommendedDifficulty: number;
  adjustment: number;
  confidence: number;
  factors: {
    accuracy: number;
    speed: number;
    consistency: number;
    improvement: number;
  };
}

interface LearningPattern {
  timeOfDay: string;
  sessionLength: number;
  breakFrequency: number;
  focusLevel: number;
  errorPatterns: string[];
}

export const AdaptiveDifficultySystem: React.FC<AdaptiveDifficultySystemProps> = ({
  userId,
  currentCharacter,
  onDifficultyAdjust,
  className = ''
}) => {
  const [userPerformance, setUserPerformance] = useState<UserPerformance>({
    accuracy: 0,
    speed: 0,
    consistency: 0,
    improvement: 0,
    attempts: 0,
    averageScore: 0
  });

  const [difficultyMetrics, setDifficultyMetrics] = useState<DifficultyMetrics>({
    currentDifficulty: currentCharacter.difficulty,
    recommendedDifficulty: currentCharacter.difficulty,
    adjustment: 0,
    confidence: 0,
    factors: {
      accuracy: 0,
      speed: 0,
      consistency: 0,
      improvement: 0
    }
  });

  const [learningPattern, setLearningPattern] = useState<LearningPattern>({
    timeOfDay: 'morning',
    sessionLength: 0,
    breakFrequency: 0,
    focusLevel: 0,
    errorPatterns: []
  });

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock data - in real app, this would come from analytics service
  useEffect(() => {
    const loadUserData = async () => {
      setIsAnalyzing(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock performance data
      const mockPerformance: UserPerformance = {
        accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
        speed: Math.floor(Math.random() * 40) + 60, // 60-100%
        consistency: Math.floor(Math.random() * 35) + 65, // 65-100%
        improvement: Math.floor(Math.random() * 20) + 5, // 5-25%
        attempts: Math.floor(Math.random() * 50) + 10,
        averageScore: Math.floor(Math.random() * 25) + 75 // 75-100%
      };

      setUserPerformance(mockPerformance);

      // Calculate difficulty adjustment
      const factors = {
        accuracy: mockPerformance.accuracy / 100,
        speed: mockPerformance.speed / 100,
        consistency: mockPerformance.consistency / 100,
        improvement: mockPerformance.improvement / 100
      };

      const weightedScore = (
        factors.accuracy * 0.4 +
        factors.speed * 0.2 +
        factors.consistency * 0.3 +
        factors.improvement * 0.1
      );

      const adjustment = Math.round((weightedScore - 0.7) * 2); // -0.6 to +0.6
      const recommendedDifficulty = Math.max(1, Math.min(5, currentCharacter.difficulty + adjustment));
      const confidence = Math.min(95, Math.max(60, weightedScore * 100));

      setDifficultyMetrics({
        currentDifficulty: currentCharacter.difficulty,
        recommendedDifficulty,
        adjustment,
        confidence,
        factors
      });

      setIsAnalyzing(false);
    };

    loadUserData();
  }, [currentCharacter.difficulty]);

  const handleDifficultyAdjust = () => {
    const adjustment: DifficultyAdjustment = {
      characterId: currentCharacter.id,
      newDifficulty: difficultyMetrics.recommendedDifficulty,
      reason: getAdjustmentReason(),
      confidence: difficultyMetrics.confidence / 100,
      timestamp: new Date().toISOString()
    };

    onDifficultyAdjust(adjustment);
  };

  const getAdjustmentReason = () => {
    const { adjustment, factors } = difficultyMetrics;
    
    if (adjustment > 0) {
      return `Performance improved: ${Math.round(factors.accuracy * 100)}% accuracy, ${Math.round(factors.speed * 100)}% speed`;
    } else if (adjustment < 0) {
      return `Performance declined: ${Math.round(factors.accuracy * 100)}% accuracy, needs more practice`;
    } else {
      return `Performance stable: maintaining current difficulty level`;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 1) return 'text-green-600 bg-green-50';
    if (difficulty <= 2) return 'text-yellow-600 bg-yellow-50';
    if (difficulty <= 3) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAdjustmentIcon = (adjustment: number) => {
    if (adjustment > 0) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (adjustment < 0) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Target className="w-5 h-5 text-blue-600" />;
  };

  const recommendations = useMemo(() => {
    const recs = [];
    
    if (userPerformance.accuracy < 70) {
      recs.push("Focus on accuracy over speed - take your time with each stroke");
    }
    
    if (userPerformance.speed < 60) {
      recs.push("Practice more frequently to improve drawing speed");
    }
    
    if (userPerformance.consistency < 70) {
      recs.push("Work on consistent stroke quality and proportions");
    }
    
    if (userPerformance.improvement < 10) {
      recs.push("Consider reviewing previously learned characters");
    }
    
    if (recs.length === 0) {
      recs.push("Great progress! Keep up the consistent practice");
    }
    
    return recs;
  }, [userPerformance]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-2xl font-bold text-gray-900">Adaptive Difficulty</h2>
          <p className="body text-gray-600">
            AI-powered difficulty adjustment based on your performance
          </p>
        </div>
        
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View Analysis</span>
        </button>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Difficulty */}
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Current Difficulty</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(difficultyMetrics.currentDifficulty)}`}>
              Level {difficultyMetrics.currentDifficulty}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {difficultyMetrics.currentDifficulty}/5
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(difficultyMetrics.currentDifficulty / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Recommended Difficulty */}
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Recommended</h3>
            {getAdjustmentIcon(difficultyMetrics.adjustment)}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {difficultyMetrics.recommendedDifficulty}/5
          </div>
          <div className="text-sm text-gray-600">
            {difficultyMetrics.adjustment > 0 && `+${difficultyMetrics.adjustment} increase`}
            {difficultyMetrics.adjustment < 0 && `${difficultyMetrics.adjustment} decrease`}
            {difficultyMetrics.adjustment === 0 && 'No change needed'}
          </div>
        </div>

        {/* Confidence Score */}
        <div className="bg-white border-base rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading text-lg font-semibold">Confidence</h3>
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {Math.round(difficultyMetrics.confidence)}%
          </div>
          <div className="text-sm text-gray-600">
            AI confidence in recommendation
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white border-base rounded-lg p-6 shadow-sm">
        <h3 className="heading text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getPerformanceColor(userPerformance.accuracy)}`}>
              {userPerformance.accuracy}%
            </div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getPerformanceColor(userPerformance.speed)}`}>
              {userPerformance.speed}%
            </div>
            <div className="text-sm text-gray-600">Speed</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getPerformanceColor(userPerformance.consistency)}`}>
              {userPerformance.consistency}%
            </div>
            <div className="text-sm text-gray-600">Consistency</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getPerformanceColor(userPerformance.improvement + 50)}`}>
              +{userPerformance.improvement}%
            </div>
            <div className="text-sm text-gray-600">Improvement</div>
          </div>
        </div>
      </div>

      {/* Analysis Panel */}
      <AnimatePresence>
        {showAnalysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-base rounded-lg p-6 shadow-sm"
          >
            <h3 className="heading text-lg font-semibold mb-4">Detailed Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Factors */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Performance Factors</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Accuracy</span>
                      <span>{Math.round(difficultyMetrics.factors.accuracy * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${difficultyMetrics.factors.accuracy * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Speed</span>
                      <span>{Math.round(difficultyMetrics.factors.speed * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${difficultyMetrics.factors.speed * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Consistency</span>
                      <span>{Math.round(difficultyMetrics.factors.consistency * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${difficultyMetrics.factors.consistency * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Improvement</span>
                      <span>{Math.round(difficultyMetrics.factors.improvement * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${difficultyMetrics.factors.improvement * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handleDifficultyAdjust}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Apply Difficulty Adjustment</span>
        </button>
        
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="flex items-center space-x-2 px-6 py-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View Detailed Analysis</span>
        </button>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your performance...</p>
        </div>
      )}
    </div>
  );
};
