import React from "react";

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]; // pre-sorted desc by XP
  currentUserId?: string;
}

const Medal: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank > 3) return null;
  const color = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : "#CD7F32";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" fill={color} />
      <path d="M8 12l-2 8 6-4 6 4-2-8" fill={color} />
    </svg>
  );
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, currentUserId }) => {
  return (
    <div className="border-base bg-white p-6">
      <div className="body text-base font-medium mb-4">Leaderboard</div>
      <ul className="space-y-2">
        {entries.map((e, idx) => {
          const isUser = e.id === currentUserId;
          return (
            <li
              key={e.id}
              className={`flex items-center justify-between px-3 py-2 border-base ${isUser ? 'border-l-2 border-black pl-2' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="heading text-xl font-bold w-6 text-center">{idx + 1}</div>
                <Medal rank={idx + 1} />
                <div className="body text-base">{e.name}</div>
              </div>
              <div className="body text-sm text-right">{e.xp.toLocaleString()} XP</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};


