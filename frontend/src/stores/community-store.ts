import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Forum, ForumPost, ForumReply, StudyGroup, GroupMember, User } from '@/types';

interface CommunityState {
  // Forums
  forums: Forum[];
  currentForum: Forum | null;
  forumPosts: ForumPost[];
  currentPost: ForumPost | null;
  postReplies: ForumReply[];
  
  // Study Groups
  studyGroups: StudyGroup[];
  currentGroup: StudyGroup | null;
  groupMembers: GroupMember[];
  userGroups: StudyGroup[];
  
  // Leaderboard
  leaderboard: User[];
  
  // Search and filters
  searchQuery: string;
  filters: {
    category?: string;
    level?: string;
    sortBy?: 'recent' | 'popular' | 'members';
  };
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CommunityActions {
  // Forum actions
  setForums: (forums: Forum[]) => void;
  setCurrentForum: (forum: Forum | null) => void;
  setForumPosts: (posts: ForumPost[]) => void;
  addForumPost: (post: ForumPost) => void;
  updateForumPost: (id: string, updates: Partial<ForumPost>) => void;
  removeForumPost: (id: string) => void;
  setCurrentPost: (post: ForumPost | null) => void;
  setPostReplies: (replies: ForumReply[]) => void;
  addPostReply: (reply: ForumReply) => void;
  updatePostReply: (id: string, updates: Partial<ForumReply>) => void;
  removePostReply: (id: string) => void;
  likePost: (id: string) => void;
  unlikePost: (id: string) => void;
  
  // Study Group actions
  setStudyGroups: (groups: StudyGroup[]) => void;
  setCurrentGroup: (group: StudyGroup | null) => void;
  addStudyGroup: (group: StudyGroup) => void;
  updateStudyGroup: (id: string, updates: Partial<StudyGroup>) => void;
  removeStudyGroup: (id: string) => void;
  setGroupMembers: (members: GroupMember[]) => void;
  addGroupMember: (member: GroupMember) => void;
  removeGroupMember: (userId: string) => void;
  setUserGroups: (groups: StudyGroup[]) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  
  // Leaderboard actions
  setLeaderboard: (users: User[]) => void;
  
  // Search and filter actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<CommunityState['filters']>) => void;
  clearFilters: () => void;
  
  // Loading and error actions
  setLoading: (loading: boolean) => void;
  setSearching: (searching: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<CommunityState['pagination']>) => void;
  
  // Utility actions
  clearCommunity: () => void;
  clearError: () => void;
}

type CommunityStore = CommunityState & CommunityActions;

const defaultFilters = {
  sortBy: 'recent' as const,
};

export const useCommunityStore = create<CommunityStore>()(
  persist(
    (set, get) => ({
      // State
      forums: [],
      currentForum: null,
      forumPosts: [],
      currentPost: null,
      postReplies: [],
      studyGroups: [],
      currentGroup: null,
      groupMembers: [],
      userGroups: [],
      leaderboard: [],
      searchQuery: '',
      filters: defaultFilters,
      isLoading: false,
      isSearching: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },

      // Forum actions
      setForums: (forums) => set({ forums }),
      setCurrentForum: (forum) => set({ currentForum: forum }),
      setForumPosts: (posts) => set({ forumPosts: posts }),
      addForumPost: (post) => set((state) => ({
        forumPosts: [post, ...state.forumPosts],
      })),
      updateForumPost: (id, updates) => set((state) => ({
        forumPosts: state.forumPosts.map((post) =>
          post.id === id ? { ...post, ...updates } : post
        ),
        currentPost: state.currentPost?.id === id 
          ? { ...state.currentPost, ...updates }
          : state.currentPost,
      })),
      removeForumPost: (id) => set((state) => ({
        forumPosts: state.forumPosts.filter((post) => post.id !== id),
        currentPost: state.currentPost?.id === id ? null : state.currentPost,
      })),
      setCurrentPost: (post) => set({ currentPost: post }),
      setPostReplies: (replies) => set({ postReplies: replies }),
      addPostReply: (reply) => set((state) => ({
        postReplies: [reply, ...state.postReplies],
      })),
      updatePostReply: (id, updates) => set((state) => ({
        postReplies: state.postReplies.map((reply) =>
          reply.id === id ? { ...reply, ...updates } : reply
        ),
      })),
      removePostReply: (id) => set((state) => ({
        postReplies: state.postReplies.filter((reply) => reply.id !== id),
      })),
      likePost: (id) => set((state) => ({
        forumPosts: state.forumPosts.map((post) =>
          post.id === id ? { ...post, likes: post.likes + 1 } : post
        ),
        currentPost: state.currentPost?.id === id
          ? { ...state.currentPost, likes: state.currentPost.likes + 1 }
          : state.currentPost,
      })),
      unlikePost: (id) => set((state) => ({
        forumPosts: state.forumPosts.map((post) =>
          post.id === id ? { ...post, likes: Math.max(0, post.likes - 1) } : post
        ),
        currentPost: state.currentPost?.id === id
          ? { ...state.currentPost, likes: Math.max(0, state.currentPost.likes - 1) }
          : state.currentPost,
      })),

      // Study Group actions
      setStudyGroups: (groups) => set({ studyGroups: groups }),
      setCurrentGroup: (group) => set({ currentGroup: group }),
      addStudyGroup: (group) => set((state) => ({
        studyGroups: [group, ...state.studyGroups],
      })),
      updateStudyGroup: (id, updates) => set((state) => ({
        studyGroups: state.studyGroups.map((group) =>
          group.id === id ? { ...group, ...updates } : group
        ),
        currentGroup: state.currentGroup?.id === id 
          ? { ...state.currentGroup, ...updates }
          : state.currentGroup,
      })),
      removeStudyGroup: (id) => set((state) => ({
        studyGroups: state.studyGroups.filter((group) => group.id !== id),
        currentGroup: state.currentGroup?.id === id ? null : state.currentGroup,
      })),
      setGroupMembers: (members) => set({ groupMembers: members }),
      addGroupMember: (member) => set((state) => ({
        groupMembers: [...state.groupMembers, member],
      })),
      removeGroupMember: (userId) => set((state) => ({
        groupMembers: state.groupMembers.filter((member) => member.userId !== userId),
      })),
      setUserGroups: (groups) => set({ userGroups: groups }),
      joinGroup: (groupId) => set((state) => {
        const group = state.studyGroups.find(g => g.id === groupId);
        if (!group) return state;
        
        return {
          studyGroups: state.studyGroups.map(g =>
            g.id === groupId 
              ? { ...g, currentMembers: g.currentMembers + 1 }
              : g
          ),
          userGroups: [...state.userGroups, group],
        };
      }),
      leaveGroup: (groupId) => set((state) => ({
        studyGroups: state.studyGroups.map(g =>
          g.id === groupId 
            ? { ...g, currentMembers: Math.max(0, g.currentMembers - 1) }
            : g
        ),
        userGroups: state.userGroups.filter(g => g.id !== groupId),
      })),

      // Leaderboard actions
      setLeaderboard: (users) => set({ leaderboard: users }),

      // Search and filter actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
      })),
      clearFilters: () => set({ 
        filters: defaultFilters,
        searchQuery: '',
      }),

      // Loading and error actions
      setLoading: (isLoading) => set({ isLoading }),
      setSearching: (isSearching) => set({ isSearching }),
      setError: (error) => set({ error }),
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination },
      })),

      // Utility actions
      clearCommunity: () => set({
        forums: [],
        currentForum: null,
        forumPosts: [],
        currentPost: null,
        postReplies: [],
        studyGroups: [],
        currentGroup: null,
        groupMembers: [],
        userGroups: [],
        leaderboard: [],
        searchQuery: '',
        filters: defaultFilters,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'community-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userGroups: state.userGroups,
        filters: state.filters,
      }),
    }
  )
);

// Selectors for better performance
export const useCommunity = () => useCommunityStore((state) => ({
  forums: state.forums,
  currentForum: state.currentForum,
  forumPosts: state.forumPosts,
  currentPost: state.currentPost,
  postReplies: state.postReplies,
  studyGroups: state.studyGroups,
  currentGroup: state.currentGroup,
  groupMembers: state.groupMembers,
  userGroups: state.userGroups,
  leaderboard: state.leaderboard,
  isLoading: state.isLoading,
  isSearching: state.isSearching,
  error: state.error,
  pagination: state.pagination,
}));

export const useCommunityActions = () => useCommunityStore((state) => ({
  setForums: state.setForums,
  setCurrentForum: state.setCurrentForum,
  setForumPosts: state.setForumPosts,
  addForumPost: state.addForumPost,
  updateForumPost: state.updateForumPost,
  removeForumPost: state.removeForumPost,
  setCurrentPost: state.setCurrentPost,
  setPostReplies: state.setPostReplies,
  addPostReply: state.addPostReply,
  updatePostReply: state.updatePostReply,
  removePostReply: state.removePostReply,
  likePost: state.likePost,
  unlikePost: state.unlikePost,
  setStudyGroups: state.setStudyGroups,
  setCurrentGroup: state.setCurrentGroup,
  addStudyGroup: state.addStudyGroup,
  updateStudyGroup: state.updateStudyGroup,
  removeStudyGroup: state.removeStudyGroup,
  setGroupMembers: state.setGroupMembers,
  addGroupMember: state.addGroupMember,
  removeGroupMember: state.removeGroupMember,
  setUserGroups: state.setUserGroups,
  joinGroup: state.joinGroup,
  leaveGroup: state.leaveGroup,
  setLeaderboard: state.setLeaderboard,
  setSearchQuery: state.setSearchQuery,
  setFilters: state.setFilters,
  clearFilters: state.clearFilters,
  setLoading: state.setLoading,
  setSearching: state.setSearching,
  setError: state.setError,
  setPagination: state.setPagination,
  clearCommunity: state.clearCommunity,
  clearError: state.clearError,
}));

export const useForums = () => useCommunityStore((state) => ({
  forums: state.forums,
  currentForum: state.currentForum,
  forumPosts: state.forumPosts,
  currentPost: state.currentPost,
  postReplies: state.postReplies,
}));

export const useStudyGroups = () => useCommunityStore((state) => ({
  studyGroups: state.studyGroups,
  currentGroup: state.currentGroup,
  groupMembers: state.groupMembers,
  userGroups: state.userGroups,
}));

export const useCommunityFilters = () => useCommunityStore((state) => ({
  searchQuery: state.searchQuery,
  filters: state.filters,
}));
