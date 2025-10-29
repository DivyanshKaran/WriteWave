import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Flame, BookOpen, Award, Calendar } from "lucide-react";

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: any;
  earned: boolean;
}

interface ProfileBadgesProps {
  badges: Badge[];
}

export function ProfileBadges({ badges }: ProfileBadgesProps) {
  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Badges & Achievements
        </CardTitle>
        <CardDescription>
          {earnedBadges.length} of {badges.length} badges earned
        </CardDescription>
        <Progress value={(earnedBadges.length / badges.length) * 100} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-bold mb-3">Earned Badges</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={badge.id}
                    className="p-4 border border-accent bg-accent/5 rounded-lg text-center"
                  >
                    <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h5 className="font-bold text-sm mb-1">{badge.name}</h5>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-3">Locked Badges</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {lockedBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={badge.id}
                    className="p-4 border border-border rounded-lg text-center opacity-50"
                  >
                    <div className="w-12 h-12 mx-auto mb-2 bg-secondary rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h5 className="font-bold text-sm mb-1">{badge.name}</h5>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
