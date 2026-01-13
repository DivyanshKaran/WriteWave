import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService, CreatePostData, UpdatePostData } from '@/lib/api-client';
import { ForumSchema, PostSchema } from '@/types/schemas';

export function useForums() {
  return useQuery({
    queryKey: ['community','forums'],
    queryFn: async () => {
      const res = await communityService.getForums();
      const arr = Array.isArray(res.data) ? res.data : [];
      return arr.map((f: any) => {
        const parsed = ForumSchema.safeParse({
          id: f.id || f.slug,
          slug: f.slug,
          title: f.title,
          name: f.name,
          description: f.description,
          groupId: f.groupId || f.group,
        });
        return parsed.success ? parsed.data : null;
      }).filter(Boolean);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePosts(params?: any) {
  return useQuery({
    queryKey: ['community','posts', params || {}],
    queryFn: async () => {
      const res = await communityService.getPosts(params);
      const arr = Array.isArray(res.data) ? res.data : [];
      return arr.map((p: any) => {
        const parsed = PostSchema.safeParse({
          id: p.id,
          title: p.title,
          content: p.content || p.text,
          author: p.author,
          createdAt: p.createdAt,
          repliesCount: p.repliesCount || (p.replies?.length ?? 0),
        });
        return parsed.success ? parsed.data : null;
      }).filter(Boolean);
    },
    keepPreviousData: true,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      const res = await communityService.createPost(data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community','posts'] });
    },
  });
}

export function useUpdatePost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdatePostData) => {
      const res = await communityService.updatePost(postId, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community','posts'] });
    },
  });
}


