import React from "react";

interface StreakCardProps {
  streak: number; // e.g., 12
  weekCompletion: boolean[]; // length 7, Sun..Sat
}

const FlameIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5">
    <path d="M12 2C12 2 8 6 8 9c0 2 2 3 2 5 0 2-2 3-2 5 0 2 2 3 4 3s4-1 4-3c0-2-2-3-2-5 0-2 2-3 2-5 0-3-4-7-4-7z" fill={active ? "#FF9500" : "none"} />
  </svg>
);

export const StreakCard: React.FC<StreakCardProps> = ({ streak, weekCompletion }) => {
  return (
    <div className="border-base bg-white p-6">
      <div className="flex items-center gap-4 mb-4">
        <FlameIcon active={streak > 0} />
        <div className="heading text-2xl font-bold">{streak} days</div>
      </div>
      <div className="flex items-center gap-2">
        {weekCompletion.slice(0, 7).map((done, idx) => (
          <div
            key={idx}
            className={`w-4 h-4 border-base ${done ? 'bg-warning' : 'bg-white'}`}
            aria-label={`Day ${idx + 1} ${done ? 'completed' : 'not completed'}`}
          />
        ))}
      </div>
    </div>
  );
};


