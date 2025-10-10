"use client";

import React, { useState } from "react";
import type { StudyGroup } from '@/types';

interface StudyGroupsProps {
  groups: StudyGroup[];
  onJoin: (groupId: string) => Promise<void>;
}

const GroupCard: React.FC<{
  group: StudyGroup;
  onJoin: (groupId: string) => Promise<void>;
}> = ({ group, onJoin }) => {
  const [optimisticJoined, setOptimisticJoined] = useState(group.joined || false);
  const [pending, setPending] = useState(false);

  const handleJoin = async () => {
    if (optimisticJoined || pending) return;
    setPending(true);
    setOptimisticJoined(true);
    try {
      await onJoin(group.id);
    } catch {
      setOptimisticJoined(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="border-base bg-white p-4 relative">
      <div className="heading text-xl font-bold mb-1">{group.name}</div>
      <div className="body text-xs text-gray-600 mb-2">{group.currentMembers} members</div>
      <div className="body text-sm text-gray-800 truncate">{group.updatedAt}</div>
      <div className="absolute bottom-4 right-4">
        <button
          onClick={handleJoin}
          disabled={optimisticJoined || pending}
          className={`h-10 px-4 ${optimisticJoined ? 'bg-gray-200 text-gray-600' : 'bg-primary text-white'} hover:border-strong`}
          aria-label={optimisticJoined ? 'Joined' : 'Join group'}
        >
          {optimisticJoined ? 'Joined' : 'Join'}
        </button>
      </div>
    </div>
  );
};

export const StudyGroups: React.FC<StudyGroupsProps> = ({ groups, onJoin }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {groups.map((g) => (
        <GroupCard key={g.id} group={g} onJoin={onJoin} />
      ))}
    </div>
  );
};


