"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Insight {
  id: string;
  type: 'prediction' | 'recommendation' | 'pattern' | 'warning';
  title: string;
  description: string;
  icon: string;
  confidence: number;
  actionable: boolean;
}

interface PredictiveInsightsProps {
  insights: Insight[];
  className?: string;
}

export const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ 
  insights, 
  className = '' 
}) => {
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  const defaultInsights: Insight[] = [
    {
      id: '1',
      type: 'prediction',
      title: 'N2 Kanji Completion',
      description: 'At your current pace, you\'ll complete N2 Kanji in 47 days',
      icon: '🎯',
      confidence: 85,
      actionable: true,
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Best Learning Time',
      description: 'Your best learning time is 6-8 PM (based on performance data)',
      icon: '⏰',
      confidence: 92,
      actionable: true,
    },
    {
      id: '3',
      type: 'pattern',
      title: 'Character Difficulty',
      description: 'You struggle with characters containing 言 - focus practice here',
      icon: '🔍',
      confidence: 78,
      actionable: true,
    },
    {
      id: '4',
      type: 'warning',
      title: 'Study Streak Risk',
      description: 'You\'re at risk of breaking your streak - study for 15 minutes today',
      icon: '⚠️',
      confidence: 65,
      actionable: true,
    },
  ];

  const activeInsights = (insights.length > 0 ? insights : defaultInsights)
    .filter(insight => !dismissedInsights.has(insight.id));

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'prediction':
        return '#0066FF';
      case 'recommendation':
        return '#00A86B';
      case 'pattern':
        return '#FF9500';
      case 'warning':
        return '#DC143C';
      default:
        return '#333333';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#00A86B';
    if (confidence >= 60) return '#FF9500';
    return '#DC143C';
  };

  const handleDismiss = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
  };

  const handleAction = (insight: Insight) => {
    if (insight.actionable) {
      // In a real app, this would trigger the recommended action
      console.log('Action triggered for:', insight.title);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="heading text-lg font-semibold">AI Insights</h3>
        <div className="text-sm text-gray-600">
          {activeInsights.length} active insights
        </div>
      </div>

      <AnimatePresence>
        {activeInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative bg-white border-base p-4 rounded-sm"
          >
            {/* Left accent border */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-sm"
              style={{ backgroundColor: getInsightColor(insight.type) }}
            />
            
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="text-2xl">{insight.icon}</div>
              
              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="heading text-base font-semibold">
                    {insight.title}
                  </h4>
                  <span 
                    className="text-xs px-2 py-1 border-base"
                    style={{ 
                      backgroundColor: `${getInsightColor(insight.type)}20`,
                      borderColor: getInsightColor(insight.type)
                    }}
                  >
                    {insight.type}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600">
                  {insight.description}
                </p>
                
                {/* Confidence indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Confidence:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-2 border-base bg-gray-200">
                      <div 
                        className="h-full"
                        style={{ 
                          width: `${insight.confidence}%`,
                          backgroundColor: getConfidenceColor(insight.confidence)
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {insight.confidence}%
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                {insight.actionable && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleAction(insight)}
                      className="text-sm px-3 py-1 border-base hover:border-strong"
                    >
                      Take Action
                    </button>
                    <button
                      onClick={() => handleDismiss(insight.id)}
                      className="text-sm px-3 py-1 text-gray-500 hover:text-gray-700"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty state */}
      {activeInsights.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500"
        >
          <div className="text-4xl mb-2">🤖</div>
          <p>No active insights at the moment</p>
          <p className="text-sm">Check back later for new recommendations</p>
        </motion.div>
      )}

      {/* Privacy notice */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-sm">
        <strong>Privacy:</strong> Insights are generated from your learning data and are processed locally. 
        No personal information is shared with third parties.
      </div>
    </div>
  );
};
