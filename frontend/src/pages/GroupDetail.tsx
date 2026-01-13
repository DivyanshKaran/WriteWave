import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Trophy,
  Crown,
  Medal,
  Award,
  ArrowLeft,
  TrendingUp,
  Pin
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { communityService } from "@/lib/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForums as useForumsHook } from "@/hooks/useCommunity";

const groupMembers = [
  { id: 1, name: "SakuraLearner", initial: "S", role: "Admin", joinedDays: 120 },
  { id: 2, name: "TokyoDreamer", initial: "T", role: "Moderator", joinedDays: 98 },
  { id: 3, name: "KanjiMaster", initial: "K", role: "Member", joinedDays: 87 },
  { id: 4, name: "StudyBuddy", initial: "S", role: "Member", joinedDays: 76 },
  { id: 5, name: "JapanFan", initial: "J", role: "Member", joinedDays: 65 }
];

const groupForums = [
  {
    id: "general-discussion",
    title: "General Discussion",
    description: "Casual conversations about learning Japanese",
    posts: 234,
    lastActivity: "5 minutes ago",
    isPinned: true
  },
  {
    id: "study-tips",
    title: "Study Tips & Resources",
    description: "Share helpful resources and study methods",
    posts: 156,
    lastActivity: "1 hour ago",
    isPinned: true
  },
  {
    id: "homework-help",
    title: "Homework Help",
    description: "Get help with exercises and practice problems",
    posts: 189,
    lastActivity: "2 hours ago",
    isPinned: false
  },
  {
    id: "grammar-questions",
    title: "Grammar Questions",
    description: "Ask and answer grammar-related questions",
    posts: 312,
    lastActivity: "3 hours ago",
    isPinned: false
  },
  {
    id: "vocabulary",
    title: "Vocabulary Building",
    description: "Share new words and mnemonics",
    posts: 145,
    lastActivity: "1 day ago",
    isPinned: false
  }
];

type LeaderItem = { rank?: number; name?: string; username?: string; points?: number; streak?: number; avatar?: string };

const groupNames: Record<string, { name: string; level: string; description: string }> = {
  "n5-study-squad": {
    name: "N5 Study Squad",
    level: "Beginner",
    description: "Daily practice sessions for JLPT N5 preparation"
  },
  "kanji-warriors": {
    name: "Kanji Warriors",
    level: "Intermediate",
    description: "Learning 10 new kanji every week together"
  },
  "conversation-club": {
    name: "Conversation Club",
    level: "All Levels",
    description: "Weekly video calls for Japanese conversation practice"
  }
};

export default function GroupDetail() {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState<{ name: string; level?: string; description?: string }>({ name: "Study Group" });
  const [forums, setForums] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderItem[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!groupId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await communityService.getStudyGroup(groupId);
        const g = res.data || {};
        setGroupInfo({ name: g.name || g.title || 'Study Group', level: g.level, description: g.description });
        setMembers(g.members || []);
        try {
          const fRes = await communityService.getForums();
          const list = (fRes.data || []).filter((f: any) => (f.groupId || f.group) === groupId);
          setForums(list);
        } catch {}
        try {
          const lb = await communityService.getGroupLeaderboard(groupId, period as any);
          const list: LeaderItem[] = (lb.data || []).map((u: any, idx: number) => ({
            rank: u.rank || idx + 1,
            name: u.name,
            username: u.username,
            points: u.points,
            streak: u.streak,
            avatar: (u.name || u.username || 'U')[0],
          }));
          setLeaderboard(list);
        } catch {}
      } catch (e: any) {
        setError(e?.message || 'Failed to load group');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId, period]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <Link to="/groups" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Groups
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="mb-2">{groupInfo.name}</h1>
                {groupInfo.description && <p className="text-muted-foreground mb-4">{groupInfo.description}</p>}
                <div className="flex items-center gap-3">
                  {groupInfo.level && <Badge variant="secondary">{groupInfo.level}</Badge>}
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                    Active
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{members?.length ?? 0} members</span>
                  </div>
                </div>
              </div>
              <Button>Join Group</Button>
            </div>
          </div>

          <Tabs defaultValue="forums" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="forums" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Forums
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2">
                <Users className="w-4 h-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="gap-2">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="forums" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Forums</h2>
                  <p className="text-muted-foreground">Discuss topics with group members</p>
                </div>
                <Button>New Forum</Button>
              </div>
              
              <div className="space-y-3">
                {loading && <div>Loading...</div>}
                {error && <div className="text-destructive">{error}</div>}
                {!loading && !error && forums.map((forum: any) => (
                  <Link key={forum.id || forum.slug} to={`/groups/${groupId}/forums/${forum.id || forum.slug}`}>
                    <Card className="hover:border-accent transition-colors cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-lg">{forum.title || forum.name}</CardTitle>
                                {forum.isPinned && (
                                  <Pin className="w-4 h-4 text-primary flex-shrink-0" />
                                )}
                              </div>
                              {forum.description && <CardDescription className="mb-3">{forum.description}</CardDescription>}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {forum.posts != null && <span>{forum.posts} posts</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {forum.lastActivity && <span>Active {forum.lastActivity}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Group Members</CardTitle>
                  <CardDescription>Connect with fellow learners</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.map((member: any, idx: number) => (
                      <div key={member.id || idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {member.initial || member.name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold">{member.name || `Member ${idx+1}`}</p>
                            {member.joinedDays && (
                              <p className="text-sm text-muted-foreground">Joined {member.joinedDays} days ago</p>
                            )}
                          </div>
                        </div>
                        {member.role && (
                          <Badge variant={member.role === "Admin" ? "default" : "secondary"}>
                            {member.role}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle>Group Leaderboard</CardTitle>
                      <CardDescription>Top performers in this study group</CardDescription>
                    </div>
                    <div className="w-[180px]">
                      <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map((user, i) => (
                      <div 
                        key={i}
                        className={`p-4 border rounded-lg flex items-center justify-between ${
                          (user.rank || i+1) <= 3 ? 'border-accent bg-accent/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                            (user.rank || i+1) === 1 ? 'bg-yellow-500 text-white' :
                            (user.rank || i+1) === 2 ? 'bg-gray-400 text-white' :
                            (user.rank || i+1) === 3 ? 'bg-amber-700 text-white' :
                            'bg-secondary text-foreground'
                          }`}>
                            {(user.rank || i+1) <= 3 ? (
                              (user.rank || i+1) === 1 ? <Crown className="w-6 h-6" /> :
                              (user.rank || i+1) === 2 ? <Medal className="w-6 h-6" /> :
                              <Award className="w-6 h-6" />
                            ) : (user.rank || i+1)}
                          </div>
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {user.avatar || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold">{user.name || user.username || 'User'}</p>
                            {user.streak != null && (
                              <p className="text-sm text-muted-foreground">{user.streak} day streak</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {user.points != null && (
                            <p className="font-bold text-lg text-primary">{Number(user.points).toLocaleString()}</p>
                          )}
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
