"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

interface HeatmapData {
  date: string;
  xp: number;
}

interface LearningHeatmapProps {
  data: HeatmapData[];
  className?: string;
}

export const LearningHeatmap: React.FC<LearningHeatmapProps> = ({ data, className = '' }) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapData | null>(null);
  const [selectedDay, setSelectedDay] = useState<HeatmapData | null>(null);

  // Generate default data if none provided
  const defaultData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random XP with some patterns
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseXP = isWeekend ? Math.random() * 50 : Math.random() * 100;
      
      days.push({
        date: date.toISOString().split('T')[0],
        xp: Math.floor(baseXP),
      });
    }
    
    return days;
  }, []);

  const heatmapData = data.length > 0 ? data : defaultData;

  // Calculate color intensity
  const maxXP = Math.max(...heatmapData.map(d => d.xp));
  const colorScale = d3.scaleLinear()
    .domain([0, maxXP])
    .range([0, 1]);

  // Group data by weeks
  const weeks = useMemo(() => {
    const weekGroups: HeatmapData[][] = [];
    let currentWeek: HeatmapData[] = [];
    
    heatmapData.forEach((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      
      currentWeek.push(day);
      
      if (dayOfWeek === 6 || index === heatmapData.length - 1) {
        weekGroups.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    return weekGroups;
  }, [heatmapData]);

  // Square dimensions
  const squareSize = 12;
  const squareGap = 2;

  const handleDayClick = (day: HeatmapData) => {
    setSelectedDay(day);
    // In a real app, this would navigate to the day's activity log
    console.log('Navigate to:', day.date);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="heading text-lg font-semibold">Learning Heatmap</h3>
        <div className="text-sm text-gray-600">
          {heatmapData.length} days of activity
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative">
        <div className="flex gap-1 overflow-x-auto pb-4">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                const intensity = colorScale(day.xp);
                const backgroundColor = `rgba(0, 102, 255, ${intensity})`;
                
                return (
                  <motion.div
                    key={day.date}
                    className="border-base cursor-pointer hover:border-strong"
                    style={{
                      width: squareSize,
                      height: squareSize,
                      backgroundColor: day.xp > 0 ? backgroundColor : '#F8F8F8',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => handleDayClick(day)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bg-white border-base shadow-lg p-3 rounded-sm pointer-events-none z-10"
            style={{
              left: '50%',
              top: -60,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-sm space-y-1">
              <div className="font-medium">
                {d3.timeFormat('%B %d, %Y')(new Date(hoveredDay.date))}
              </div>
              <div>XP earned: {hoveredDay.xp}</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Less</span>
          <div className="flex gap-1">
            {[0, 0.25, 0.5, 0.75, 1].map(intensity => (
              <div
                key={intensity}
                className="w-3 h-3 border-base"
                style={{ backgroundColor: `rgba(0, 102, 255, ${intensity})` }}
              />
            ))}
          </div>
          <span className="text-gray-600">More</span>
        </div>
        
        <div className="text-gray-600">
          Max: {maxXP} XP
        </div>
      </div>

      {/* Selected Day Info */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 border-base p-4 rounded-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">
                {d3.timeFormat('%B %d, %Y')(new Date(selectedDay.date))}
              </h4>
              <p className="text-sm text-gray-600">
                {selectedDay.xp} XP earned
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Month Labels */}
      <div className="flex gap-1 text-xs text-gray-500">
        {weeks.map((week, index) => {
          if (index % 4 === 0) {
            const firstDay = week[0];
            const month = d3.timeFormat('%b')(new Date(firstDay.date));
            return (
              <div key={index} className="w-3 text-center">
                {month}
              </div>
            );
          }
          return <div key={index} className="w-3" />;
        })}
      </div>
    </div>
  );
};
