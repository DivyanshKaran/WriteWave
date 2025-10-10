"use client";

import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  type: 'milestone' | 'streak' | 'skill' | 'special';
}

interface AchievementTimelineProps {
  achievements: Achievement[];
  className?: string;
}

export const AchievementTimeline: React.FC<AchievementTimelineProps> = ({ 
  achievements, 
  className = '' 
}) => {
  const [expandedAchievement, setExpandedAchievement] = useState<string | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const defaultAchievements: Achievement[] = [
    {
      id: '1',
      title: 'First Kanji Mastered',
      description: 'Successfully learned your first 10 kanji characters',
      date: '2024-01-15',
      icon: '字',
      type: 'milestone',
    },
    {
      id: '2',
      title: '7-Day Streak',
      description: 'Studied for 7 consecutive days',
      date: '2024-01-22',
      icon: '🔥',
      type: 'streak',
    },
    {
      id: '3',
      title: 'Hiragana Complete',
      description: 'Mastered all 80 hiragana characters',
      date: '2024-02-05',
      icon: 'あ',
      type: 'skill',
    },
    {
      id: '4',
      title: 'Vocabulary Builder',
      description: 'Learned 100 new vocabulary words',
      date: '2024-02-18',
      icon: '📚',
      type: 'milestone',
    },
    {
      id: '5',
      title: 'Grammar Master',
      description: 'Completed basic grammar section',
      date: '2024-03-01',
      icon: '📝',
      type: 'skill',
    },
  ];

  const timelineData = achievements.length > 0 ? achievements : defaultAchievements;

  const getAchievementColor = (type: Achievement['type']) => {
    switch (type) {
      case 'milestone':
        return '#0066FF';
      case 'streak':
        return '#FF9500';
      case 'skill':
        return '#00A86B';
      case 'special':
        return '#8B5CF6';
      default:
        return '#333333';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="heading text-lg font-semibold">Recent Achievements</h3>
      
      <div ref={ref} className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-black"></div>
        
        <div className="space-y-6">
          {timelineData.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex items-start gap-4"
            >
              {/* Achievement node */}
              <motion.div
                className="relative z-10 w-8 h-8 border-2 border-black bg-white rounded-full flex items-center justify-center text-sm font-medium"
                style={{ borderColor: getAchievementColor(achievement.type) }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {achievement.icon}
              </motion.div>
              
              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {formatDate(achievement.date)}
                  </span>
                  <span 
                    className="text-xs px-2 py-1 border-base"
                    style={{ 
                      backgroundColor: `${getAchievementColor(achievement.type)}20`,
                      borderColor: getAchievementColor(achievement.type)
                    }}
                  >
                    {achievement.type}
                  </span>
                </div>
                
                <h4 className="heading text-base font-semibold">
                  {achievement.title}
                </h4>
                
                {expandedAchievement === achievement.id ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                    <button
                      onClick={() => setExpandedAchievement(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Show less
                    </button>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setExpandedAchievement(achievement.id)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Show more
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* View All Button */}
      <div className="text-center">
        <button className="text-sm text-gray-500 hover:text-gray-700 border-base px-4 py-2">
          View All Achievements
        </button>
      </div>
    </div>
  );
};
