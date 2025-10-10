"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

interface SkillData {
  name: string;
  mastery: number;
  itemsMastered: number;
  totalItems: number;
  color: string;
}

interface SkillBreakdownProps {
  data: SkillData[];
  className?: string;
}

export const SkillBreakdown: React.FC<SkillBreakdownProps> = ({ data, className = '' }) => {
  const [viewMode, setViewMode] = useState<'radar' | 'bars'>('radar');
  const [hoveredSkill, setHoveredSkill] = useState<SkillData | null>(null);

  const defaultData: SkillData[] = [
    { name: 'Hiragana', mastery: 85, itemsMastered: 68, totalItems: 80, color: '#0066FF' },
    { name: 'Katakana', mastery: 72, itemsMastered: 58, totalItems: 80, color: '#00A86B' },
    { name: 'Kanji', mastery: 45, itemsMastered: 225, totalItems: 500, color: '#FF9500' },
    { name: 'Vocabulary', mastery: 60, itemsMastered: 300, totalItems: 500, color: '#DC143C' },
    { name: 'Grammar', mastery: 35, itemsMastered: 70, totalItems: 200, color: '#8B5CF6' },
  ];

  const skills = data.length > 0 ? data : defaultData;

  // Radar chart dimensions
  const radarSize = 300;
  const radarCenter = radarSize / 2;
  const radarRadius = radarCenter - 40;

  // Radar chart scales
  const angleScale = d3.scaleLinear()
    .domain([0, skills.length])
    .range([0, 2 * Math.PI]);

  const radiusScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, radarRadius]);

  // Generate radar points
  const radarPoints = skills.map((skill, index) => {
    const angle = angleScale(index);
    const radius = radiusScale(skill.mastery);
    return {
      x: radarCenter + radius * Math.cos(angle - Math.PI / 2),
      y: radarCenter + radius * Math.sin(angle - Math.PI / 2),
      skill,
      angle,
    };
  });

  // Radar path
  const radarPath = d3.line<typeof radarPoints[0]>()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveLinearClosed);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="heading text-lg font-semibold">Skill Breakdown</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('radar')}
            className={`px-3 py-1 text-sm border-base ${
              viewMode === 'radar' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            Radar
          </button>
          <button
            onClick={() => setViewMode('bars')}
            className={`px-3 py-1 text-sm border-base ${
              viewMode === 'bars' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            Bars
          </button>
        </div>
      </div>

      {/* Radar Chart */}
      {viewMode === 'radar' && (
        <div className="flex justify-center">
          <div className="relative">
            <svg width={radarSize} height={radarSize} className="border-base">
              {/* Grid circles */}
              {[20, 40, 60, 80, 100].map(level => (
                <circle
                  key={level}
                  cx={radarCenter}
                  cy={radarCenter}
                  r={radiusScale(level)}
                  fill="none"
                  stroke="#E5E5E5"
                  strokeWidth={1}
                />
              ))}

              {/* Grid lines */}
              {skills.map((_, index) => {
                const angle = angleScale(index);
                const x = radarCenter + radarRadius * Math.cos(angle - Math.PI / 2);
                const y = radarCenter + radarRadius * Math.sin(angle - Math.PI / 2);
                return (
                  <line
                    key={index}
                    x1={radarCenter}
                    y1={radarCenter}
                    x2={x}
                    y2={y}
                    stroke="#E5E5E5"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Skill labels */}
              {skills.map((skill, index) => {
                const angle = angleScale(index);
                const x = radarCenter + (radarRadius + 20) * Math.cos(angle - Math.PI / 2);
                const y = radarCenter + (radarRadius + 20) * Math.sin(angle - Math.PI / 2);
                return (
                  <text
                    key={skill.name}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#333333"
                    dy="0.35em"
                  >
                    {skill.name}
                  </text>
                );
              })}

              {/* Radar area */}
              <motion.path
                d={radarPath(radarPoints) || ''}
                fill="rgba(0, 102, 255, 0.2)"
                stroke="#0066FF"
                strokeWidth={2}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />

              {/* Data points */}
              {radarPoints.map((point, index) => (
                <motion.circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill={point.skill.color}
                  stroke="black"
                  strokeWidth={1}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredSkill(point.skill)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  className="cursor-pointer"
                />
              ))}
            </svg>

            {/* Tooltip */}
            {hoveredSkill && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bg-white border-base shadow-lg p-3 rounded-sm pointer-events-none"
                style={{
                  left: radarCenter - 75,
                  top: radarCenter - 80,
                }}
              >
                <div className="text-sm space-y-1">
                  <div className="font-medium">{hoveredSkill.name}</div>
                  <div>Mastery: {hoveredSkill.mastery}%</div>
                  <div>Items: {hoveredSkill.itemsMastered}/{hoveredSkill.totalItems}</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Bar Chart */}
      {viewMode === 'bars' && (
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{skill.name}</span>
                <span className="text-sm text-gray-600">
                  {skill.itemsMastered}/{skill.totalItems}
                </span>
              </div>
              
              <div className="relative h-6 border-base bg-white">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: skill.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.mastery}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                />
                
                {skill.mastery > 20 ? (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {skill.mastery}%
                  </span>
                ) : (
                  <span className="absolute left-full ml-2 text-xs font-medium text-gray-600 top-1/2 -translate-y-1/2">
                    {skill.mastery}%
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {skills.map(skill => (
          <div key={skill.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 border-base" 
              style={{ backgroundColor: skill.color }}
            ></div>
            <span>{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
