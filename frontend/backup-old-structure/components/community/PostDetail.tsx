"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface Post {
  id: string;
  title: string;
  author: string;
  avatarUrl?: string;
  timestamp: string;
  content: string;
}

export interface Reply {
  id: string;
  author: string;
  avatarUrl?: string;
  timestamp: string;
  content: string;
  replies?: Reply[];
}

interface PostDetailProps {
  post: Post;
  replies: Reply[];
  onReply: (content: string, parentId?: string) => Promise<void>;
}

const ActionsBar: React.FC<{ repliesCount: number }> = ({ repliesCount }) => (
  <div className="flex items-center gap-6 body text-sm text-gray-600">
    <button className="hover:underline">Reply</button>
    <button className="hover:underline">Like</button>
    <button className="hover:underline">Share</button>
    <span className="text-gray-600">{repliesCount} replies</span>
  </div>
);

const ComposeForm: React.FC<{
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
}> = ({ onSubmit, onCancel, placeholder }) => {
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setPending(true);
    await onSubmit(value.trim());
    setValue("");
    setPending(false);
  };

  return (
    <div className="space-y-2">
      <textarea
        className="w-full min-h-[120px] border-base p-4 body text-base focus:outline-none focus-ring"
        placeholder={placeholder || "Write your reply..."}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={pending}
          className="h-12 px-4 bg-black text-white hover:border-strong disabled:bg-gray-200 disabled:text-gray-600"
        >
          Post Reply
        </button>
        {onCancel && (
          <button onClick={onCancel} className="h-12 px-4 bg-white text-black border-base hover:border-strong">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

const ReplyNode: React.FC<{
  reply: Reply;
  depth?: number;
  onReply: (content: string, parentId?: string) => Promise<void>;
}> = ({ reply, depth = 0, onReply }) => {
  const [showForm, setShowForm] = useState(false);
  const maxDepth = 3;
  return (
    <div className={`pl-${depth * 8} relative`}> {/* 32px per level => 8 * 4 spacing steps */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 border-l border-gray-200" />
      )}
      <div className="py-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 border-base rounded-full overflow-hidden flex items-center justify-center">
            {reply.avatarUrl ? (
              <Image src={reply.avatarUrl} alt={reply.author} width={32} height={32} />
            ) : (
              <div className="w-6 h-6 bg-gray-200 rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="body text-base font-semibold">{reply.author}</span>
              <span className="body text-xs text-gray-600">{reply.timestamp}</span>
            </div>
            <div className="body text-base leading-[1.6] text-black whitespace-pre-wrap">
              {reply.content}
            </div>
            <div className="mt-2 body text-sm text-gray-600">
              {depth < maxDepth && (
                <button className="hover:underline" onClick={() => setShowForm(!showForm)}>
                  Reply
                </button>
              )}
            </div>
            {showForm && depth < maxDepth && (
              <div className="mt-2">
                <ComposeForm
                  onSubmit={async (content) => {
                    await onReply(content, reply.id);
                    setShowForm(false);
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {reply.replies?.map((child) => (
        <ReplyNode key={child.id} reply={child} depth={depth + 1} onReply={onReply} />
      ))}
    </div>
  );
};

export const PostDetail: React.FC<PostDetailProps> = ({ post, replies, onReply }) => {
  const [optimisticReplies, setOptimisticReplies] = useState<Reply[]>(replies);

  const handleReply = async (content: string, parentId?: string) => {
    const tempId = `temp_${Date.now()}`;
    const newReply: Reply = {
      id: tempId,
      author: "You",
      timestamp: "just now",
      content,
    };

    if (!parentId) {
      setOptimisticReplies((prev) => [{ ...newReply }, ...prev]);
    } else {
      const insertReply = (nodes: Reply[]): Reply[] =>
        nodes.map((n) =>
          n.id === parentId
            ? { ...n, replies: [{ ...newReply }, ...(n.replies || [])] }
            : { ...n, replies: n.replies ? insertReply(n.replies) : undefined }
        );
      setOptimisticReplies((prev) => insertReply(prev));
    }

    try {
      await onReply(content, parentId);
    } catch {
      // revert on failure if needed; for now, leave optimistic
    }
  };

  return (
    <div className="max-w-[720px] mx-auto">
      {/* Original Post */}
      <article className="border-base bg-white p-6">
        <header className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 border-base rounded-full overflow-hidden flex items-center justify-center">
            {post.avatarUrl ? (
              <Image src={post.avatarUrl} alt={post.author} width={32} height={32} />
            ) : (
              <div className="w-6 h-6 bg-gray-200 rounded-full" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="body text-base font-semibold">{post.author}</span>
              <span className="body text-xs text-gray-600">{post.timestamp}</span>
            </div>
          </div>
          <button className="h-8 px-3 bg-white text-black border-base hover:border-strong">Follow</button>
        </header>
        <h1 className="heading text-xl font-medium mb-3">{post.title}</h1>
        <div className="body text-base leading-[1.6] text-black whitespace-pre-wrap">
          {post.content}
        </div>
        <div className="mt-4">
          <ActionsBar repliesCount={optimisticReplies.length} />
        </div>
      </article>

      {/* Compose top-level reply */}
      <div className="border-base bg-white p-6 mt-4">
        <ComposeForm onSubmit={(content) => handleReply(content)} />
      </div>

      {/* Replies */}
      <section className="mt-4 border-base bg-white p-6">
        {optimisticReplies.map((r) => (
          <ReplyNode key={r.id} reply={r} onReply={handleReply} />
        ))}
      </section>
    </div>
  );
};


