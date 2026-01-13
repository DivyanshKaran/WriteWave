import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { communityService } from "@/lib/api-client";

type StudyGroupCard = {
  id: string;
  name: string;
  members?: number;
  level?: string;
  description?: string;
  active?: boolean;
  nextMeeting?: string;
};

export default function Groups() {
  const [groups, setGroups] = useState<StudyGroupCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await communityService.getStudyGroups();
        const list: StudyGroupCard[] = (res.data || []).map((g: any) => ({
          id: g.id || g.slug || '',
          name: g.name || g.title || 'Study Group',
          members: g.membersCount || g.members,
          level: g.level,
          description: g.description,
          active: g.active,
          nextMeeting: g.nextMeeting,
        }));
        setGroups(list);
      } catch (e: any) {
        setError(e?.message || 'Failed to load groups');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="mb-4">Study Groups</h1>
            <p className="text-xl text-muted-foreground">
              Join or create a group to learn together and stay motivated
            </p>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                Most Active
              </Badge>
              <Badge variant="outline">All Levels</Badge>
              <Badge variant="outline">Beginner</Badge>
              <Badge variant="outline">Intermediate</Badge>
            </div>
            <Button>Create Group</Button>
          </div>

          {loading && <div>Loading...</div>}
          {error && <div className="text-destructive">{error}</div>}
          {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link key={group.id} to={`/groups/${group.id}`}>
                <Card className="h-full hover:border-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{group.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          {group.level && <Badge variant="secondary" className="text-xs">{group.level}</Badge>}
                          {group.active && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {group.members != null && <span>{group.members}</span>}
                      </div>
                    </div>
                    {group.description && <CardDescription className="min-h-[3rem]">{group.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      {group.nextMeeting && <span>{group.nextMeeting}</span>}
                    </div>
                    <Button className="w-full" variant="outline">View Group</Button>
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
