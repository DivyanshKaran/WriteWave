import React from "react";

interface Achievement {
  id: string;
  title: string;
  progressText: string; // e.g., "8/10"
  unlocked: boolean;
  icon: React.ReactNode; // 48px
}

interface AchievementsGridProps {
  achievements: Achievement[];
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({ achievements }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {achievements.map((a) => (
        <div
          key={a.id}
          className={`w-[120px] h-[140px] border-base bg-white flex flex-col items-center justify-center text-center mx-auto ${
            a.unlocked ? '' : 'bg-gray-50'
          }`}
        >
          <div className={`mb-3 ${a.unlocked ? 'text-black' : 'text-gray-200'}`}>
            <div className="w-12 h-12 flex items-center justify-center">
              {a.icon}
            </div>
          </div>
          <div className="body text-sm font-medium mb-1">{a.title}</div>
          <div className="body text-xs text-gray-600">{a.progressText}</div>
        </div>
      ))}
    </div>
  );
};


