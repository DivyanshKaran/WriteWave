"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface DiscussionTag {
  id: string;
  label: string;
}

export interface DiscussionItemData {
  id: string;
  title: string;
  author: string;
  avatarUrl?: string;
  timestamp: string; // e.g., "2h"
  replies: number;
  tags?: DiscussionTag[];
}

interface DiscussionListProps {
  items: DiscussionItemData[];
  onNavigate?: (id: string) => void;
  loading?: boolean;
}

const SkeletonRow: React.FC = () => (
  <div className="py-4 border-b border-gray-200 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 border-base rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="w-2/3 h-4 bg-gray-50" />
        <div className="w-1/3 h-3 bg-gray-50" />
      </div>
    </div>
  </div>
);

const DiscussionRow: React.FC<{
  item: DiscussionItemData;
  onClick?: () => void;
}> = ({ item, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left py-4 border-b border-gray-200 hover:border-l-2 hover:border-black pl-2"
    aria-label={`Open discussion ${item.title}`}
  >
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 border-base rounded-full overflow-hidden flex items-center justify-center">
        {item.avatarUrl ? (
          <Image src={item.avatarUrl} alt={item.author} width={32} height={32} />
        ) : (
          <div className="w-6 h-6 bg-gray-200 rounded-full" />)
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="heading text-lg font-medium text-black truncate">
          {item.title}
        </div>
        <div className="body text-xs text-gray-600 truncate">
          {item.author} • {item.timestamp} • {item.replies} replies
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag.id} className="body text-xs border-base px-1 py-0.5">
                {tag.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </button>
);

export const DiscussionList: React.FC<DiscussionListProps> = ({ items, onNavigate, loading = false }) => {
  const [optimisticItems, setOptimisticItems] = useState(items);

  React.useEffect(() => {
    setOptimisticItems(items);
  }, [items]);

  if (loading) {
    return (
      <div className="border-base bg-white">
        {[...Array(5)].map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="border-base bg-white">
      {optimisticItems.map((item) => (
        <DiscussionRow
          key={item.id}
          item={item}
          onClick={() => onNavigate?.(item.id)}
        />
      ))}
    </div>
  );
};


