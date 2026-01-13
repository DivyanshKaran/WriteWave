import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Users, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useForums as useForumsHook } from "@/hooks/useCommunity";

type ForumCard = {
  id: string;
  groupId: string;
  groupName: string;
  forumId: string;
  forumName: string;
  description?: string;
  posts?: number;
  members?: number;
  trending?: boolean;
  lastActivity?: string;
};

export default function Forums() {
  const { data, isLoading, error } = useForumsHook();
  const forums: ForumCard[] = (data || []).map((f: any) => ({
    id: `${f.groupId || f.group || 'group'}-${f.id || f.slug || 'forum'}`,
    groupId: f.groupId || f.group || '',
    groupName: f.groupName || f.groupTitle || f.group || 'Group',
    forumId: f.id || f.slug || '',
    forumName: f.title || f.name || 'Forum',
    description: f.description,
    posts: f.postsCount || f.posts,
    members: f.membersCount || f.members,
    trending: !!f.trending,
    lastActivity: f.lastActivity,
  }));
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12">
            <h1 className="mb-4">Popular Forums</h1>
            <p className="text-xl text-muted-foreground">
              Trending discussions across all study groups
            </p>
          </div>

          <div className="mb-6">
            <Badge variant="outline" className="gap-1">
              <Flame className="w-3 h-3" />
              Trending Now
            </Badge>
          </div>

          {isLoading && <div>Loading...</div>}
          {error && <div className="text-destructive">{(error as any)?.message || 'Failed to load forums'}</div>}
          {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forums.map((forum) => (
              <Link key={forum.id} to={`/groups/${forum.groupId}/forums/${forum.forumId}`}>
                <Card className="h-full hover:border-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">{forum.groupName}</Badge>
                          {forum.trending && (
                            <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Hot
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mb-1">{forum.forumName}</CardTitle>
                        {forum.description && <CardDescription className="text-sm">{forum.description}</CardDescription>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {forum.posts != null && <span>{forum.posts} posts</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {forum.members != null && <span>{forum.members} members</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {forum.lastActivity && <span>{forum.lastActivity}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
