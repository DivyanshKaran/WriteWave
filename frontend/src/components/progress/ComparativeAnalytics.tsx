"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

interface ComparativeData {
  metric: string;
  userValue: number;
  averageValue: number;
  percentile: number;
  unit: string;
}

interface ComparativeAnalyticsProps {
  data: ComparativeData[];
  className?: string;
}

export const ComparativeAnalytics: React.FC<ComparativeAnalyticsProps> = ({ 
  data, 
  className = '' 
}) => {
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);
  const [optIn, setOptIn] = useState(false);

  const defaultData: ComparativeData[] = [
    {
      metric: 'Daily XP',
      userValue: 85,
      averageValue: 45,
      percentile: 85,
      unit: 'XP',
    },
    {
      metric: 'Study Streak',
      userValue: 12,
      averageValue: 5,
      percentile: 78,
      unit: 'days',
    },
    {
      metric: 'Characters Learned',
      userValue: 150,
      averageValue: 80,
      percentile: 92,
      unit: 'characters',
    },
    {
      metric: 'Study Time',
      userValue: 45,
      averageValue: 30,
      percentile: 65,
      unit: 'minutes',
    },
  ];

  const analyticsData = data.length > 0 ? data : defaultData;

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return '#00A86B';
    if (percentile >= 70) return '#0066FF';
    if (percentile >= 50) return '#FF9500';
    return '#DC143C';
  };

  const getPercentileLabel = (percentile: number) => {
    if (percentile >= 90) return 'Top 10%';
    if (percentile >= 80) return 'Top 20%';
    if (percentile >= 70) return 'Top 30%';
    if (percentile >= 50) return 'Above Average';
    return 'Below Average';
  };

  // Bell curve data for visualization
  const generateBellCurveData = () => {
    const data = [];
    for (let i = 0; i <= 100; i += 2) {
      const y = Math.exp(-Math.pow(i - 50, 2) / (2 * Math.pow(15, 2)));
      data.push({ x: i, y: y * 100 });
    }
    return data;
  };

  const bellCurveData = generateBellCurveData();

  if (!optIn) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="heading text-lg font-semibold">Comparative Analytics</h3>
        
        {showPrivacyNotice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border-base p-4 rounded-sm"
          >
            <div className="flex items-start gap-3">
              <div className="text-blue-600">🔒</div>
              <div className="flex-1 space-y-2">
                <h4 className="font-medium text-blue-900">Privacy Notice</h4>
                <p className="text-sm text-blue-800">
                  Comparative analytics show how your progress compares to other learners. 
                  All data is anonymized and aggregated. No personal information is shared.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setOptIn(true);
                      setShowPrivacyNotice(false);
                    }}
                    className="text-sm px-3 py-1 bg-blue-600 text-white border-base hover:bg-blue-700"
                  >
                    Opt In
                  </button>
                  <button
                    onClick={() => setShowPrivacyNotice(false)}
                    className="text-sm px-3 py-1 text-blue-600 hover:text-blue-800"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="heading text-lg font-semibold">Comparative Analytics</h3>
        <button
          onClick={() => setOptIn(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Opt Out
        </button>
      </div>

      {/* Percentile Ranking */}
      <div className="space-y-4">
        <h4 className="heading text-base font-semibold">Your Ranking</h4>
        
        <div className="bg-white border-base p-4 rounded-sm">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">
              Top {100 - analyticsData[0]?.percentile || 0}%
            </div>
            <p className="text-sm text-gray-600">
                  You&apos;re performing better than {analyticsData[0]?.percentile || 0}% of learners
            </p>
          </div>
          
          {/* Bell curve visualization */}
          <div className="mt-4">
            <svg width="100%" height="120" className="border-base">
              {/* Bell curve */}
              <path
                d={d3.line<typeof bellCurveData[0]>()
                  .x(d => (d.x / 100) * 300 + 50)
                  .y(d => 100 - d.y)
                  .curve(d3.curveMonotoneX)(bellCurveData) || ''}
                fill="none"
                stroke="#E5E5E5"
                strokeWidth={2}
              />
              
              {/* User position marker */}
              <circle
                cx={(analyticsData[0]?.percentile || 0) * 3 + 50}
                cy={100 - (Math.exp(-Math.pow((analyticsData[0]?.percentile || 0) - 50, 2) / (2 * Math.pow(15, 2))) * 100)}
                r={6}
                fill="#0066FF"
                stroke="white"
                strokeWidth={2}
              />
              
              {/* Labels */}
              <text x="50" y="115" textAnchor="middle" fontSize="10" fill="#999999">
                0%
              </text>
              <text x="200" y="115" textAnchor="middle" fontSize="10" fill="#999999">
                50%
              </text>
              <text x="350" y="115" textAnchor="middle" fontSize="10" fill="#999999">
                100%
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="space-y-4">
        <h4 className="heading text-base font-semibold">vs. Average Learner</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analyticsData.map((metric, index) => (
            <motion.div
              key={metric.metric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white border-base p-4 rounded-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">{metric.metric}</h5>
                  <span 
                    className="text-xs px-2 py-1 border-base"
                    style={{ 
                      backgroundColor: `${getPercentileColor(metric.percentile)}20`,
                      borderColor: getPercentileColor(metric.percentile)
                    }}
                  >
                    {getPercentileLabel(metric.percentile)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">You</span>
                    <span className="font-medium">
                      {metric.userValue} {metric.unit}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average</span>
                    <span className="text-gray-500">
                      {metric.averageValue} {metric.unit}
                    </span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>{Math.max(metric.userValue, metric.averageValue)}</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 border-base">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gray-400"
                      style={{ width: `${(metric.averageValue / Math.max(metric.userValue, metric.averageValue)) * 100}%` }}
                    />
                    <div 
                      className="absolute top-0 left-0 h-full"
                      style={{ 
                        width: `${(metric.userValue / Math.max(metric.userValue, metric.averageValue)) * 100}%`,
                        backgroundColor: getPercentileColor(metric.percentile)
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Privacy reminder */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-sm">
        <strong>Privacy:</strong> All comparative data is anonymized and aggregated. 
        Your individual progress is never shared with other users.
      </div>
    </div>
  );
};
