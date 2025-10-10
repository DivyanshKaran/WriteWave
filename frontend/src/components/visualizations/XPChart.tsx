"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { TabSwitcher } from '@/components/motion';

interface XPDataPoint {
  date: string;
  xp: number;
  goal: number;
}

interface XPChartProps {
  data: XPDataPoint[];
  className?: string;
}

export const XPChart: React.FC<XPChartProps> = ({ data, className = '' }) => {
  const [timeRange, setTimeRange] = useState<'7D' | '1M' | '3M' | '1Y'>('1M');
  const [compareMode, setCompareMode] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<XPDataPoint | null>(null);

  const timeRanges = [
    { id: '7D', label: '7D' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
    { id: '1Y', label: '1Y' },
  ];

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeRange) {
      case '7D':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '1M':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case '1Y':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return data.filter(d => new Date(d.date) >= cutoff);
  }, [data, timeRange]);

  // Calculate moving average
  const movingAverageData = useMemo(() => {
    const windowSize = Math.min(7, Math.max(3, Math.floor(filteredData.length / 10)));
    return filteredData.map((point, index) => {
      const start = Math.max(0, index - windowSize + 1);
      const window = filteredData.slice(start, index + 1);
      const average = window.reduce((sum, p) => sum + p.xp, 0) / window.length;
      return { ...point, movingAverage: average };
    });
  }, [filteredData]);

  // D3 chart dimensions
  const width = 800;
  const height = 300;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };

  // D3 scales
  const xScale = d3.scaleTime()
    .domain(d3.extent(filteredData, d => new Date(d.date)) as [Date, Date])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(filteredData, d => Math.max(d.xp, d.goal)) || 100])
    .range([height - margin.bottom, margin.top]);

  // Line generator for moving average
  const line = d3.line<typeof movingAverageData[0]>()
    .x(d => xScale(new Date(d.date)))
    .y(d => yScale(d.movingAverage))
    .curve(d3.curveMonotoneX);

  // Goal line
  const goalY = yScale(filteredData[0]?.goal || 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <TabSwitcher
          activeTab={timeRange}
          tabs={timeRanges}
          onTabChange={(tabId) => setTimeRange(tabId as typeof timeRange)}
        />
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="w-4 h-4 border-base"
            />
            vs. Last Week
          </label>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg width={width} height={height} className="border-base">
          {/* Grid lines */}
          <g className="text-gray-300">
            {yScale.ticks(5).map(tick => (
              <g key={tick}>
                <line
                  x1={margin.left}
                  x2={width - margin.right}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                  stroke="#E5E5E5"
                  strokeWidth={1}
                />
                <text
                  x={margin.left - 10}
                  y={yScale(tick)}
                  textAnchor="end"
                  fontSize={12}
                  fill="#999999"
                  dy="0.35em"
                >
                  {tick}
                </text>
              </g>
            ))}
          </g>

          {/* Goal line */}
          <line
            x1={margin.left}
            x2={width - margin.right}
            y1={goalY}
            y2={goalY}
            stroke="#00A86B"
            strokeWidth={2}
            strokeDasharray="5,5"
          />

          {/* Bars */}
          {filteredData.map((point, index) => (
            <motion.rect
              key={point.date}
              x={xScale(new Date(point.date)) - 8}
              y={yScale(point.xp)}
              width={16}
              height={height - margin.bottom - yScale(point.xp)}
              fill="black"
              initial={{ height: 0, y: height - margin.bottom }}
              animate={{ height: height - margin.bottom - yScale(point.xp), y: yScale(point.xp) }}
              transition={{ duration: 0.5, delay: index * 0.02 }}
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer hover:opacity-80"
            />
          ))}

          {/* Moving average line */}
          <motion.path
            d={line(movingAverageData) || ''}
            fill="none"
            stroke="#0066FF"
            strokeWidth={2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          {/* X-axis */}
          <g transform={`translate(0, ${height - margin.bottom})`}>
            {xScale.ticks(5).map(tick => (
              <g key={tick.toString()}>
                <line
                  x1={xScale(tick)}
                  x2={xScale(tick)}
                  y1={0}
                  y2={5}
                  stroke="black"
                  strokeWidth={1}
                />
                <text
                  x={xScale(tick)}
                  y={20}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#999999"
                >
                  {d3.timeFormat('%m/%d')(tick)}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bg-white border-base shadow-lg p-3 rounded-sm pointer-events-none"
            style={{
              left: xScale(new Date(hoveredPoint.date)) - 50,
              top: yScale(hoveredPoint.xp) - 60,
            }}
          >
            <div className="text-sm space-y-1">
              <div className="font-medium">{d3.timeFormat('%B %d')(new Date(hoveredPoint.date))}</div>
              <div>XP: {hoveredPoint.xp}</div>
              <div>Goal: {hoveredPoint.goal}</div>
              <div>Progress: {Math.round((hoveredPoint.xp / hoveredPoint.goal) * 100)}%</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-black"></div>
          <span>Daily XP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary"></div>
          <span>Moving Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-success border-dashed border-t"></div>
          <span>Daily Goal</span>
        </div>
      </div>
    </div>
  );
};
