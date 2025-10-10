"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface XPCardProps {
  totalXp: number; // e.g., 2847
  level: number; // e.g., 13
  toNextLevelXp: number; // e.g., 173
  weeklyData: { day: string; xp: number }[]; // last 7 days
  levelProgress: number; // 0..1 for current level bar
}

export const XPCard: React.FC<XPCardProps> = ({
  totalXp,
  level,
  toNextLevelXp,
  weeklyData,
  levelProgress,
}) => {
  return (
    <div className="border-base bg-white p-6">
      <div className="mb-4">
        <div className="heading text-3xl font-bold">{totalXp.toLocaleString()} XP</div>
      </div>

      {/* Level progress bar */}
      <div className="mb-2">
        <div className="w-full h-4 border-base bg-white relative">
          <div
            className="h-full bg-black"
            style={{ width: `${Math.max(0, Math.min(1, levelProgress)) * 100}%` }}
          />
        </div>
      </div>
      <div className="body text-sm text-gray-600 mb-6">{toNextLevelXp} XP to Level {level + 1}</div>

      {/* XP line chart for last 7 days */}
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyData} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#F8F8F8" strokeDasharray="0 0" />
            <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: "#E5E5E5" }} stroke="#333333" fontSize={12} />
            <YAxis tickLine={false} axisLine={{ stroke: "#E5E5E5" }} stroke="#333333" fontSize={12} width={28} />
            <Tooltip
              cursor={{ stroke: "#E5E5E5", strokeWidth: 1 }}
              contentStyle={{ border: "1px solid #000", borderRadius: 0, background: "#fff" }}
              labelStyle={{ color: "#333" }}
              itemStyle={{ color: "#000" }}
            />
            <Line type="monotone" dataKey="xp" stroke="#000000" strokeWidth={2} dot={{ r: 3, stroke: "#000", fill: "#000" }} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


