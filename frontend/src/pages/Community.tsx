import { Header } from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Crown,
  Medal,
  Award,
  MessageSquare,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { communityService } from "@/lib/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Community() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(
    "monthly"
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await communityService.getLeaderboard({
          type: "global",
          period,
        } as any);
        setLeaderboard(res.data || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />

      <main className="flex-1 pt-20 sm:pt-24 pb-16 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/app")}
            className="mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Mobile-first header */}
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
              Community Hub
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-muted-foreground">
              Connect, learn, and grow with fellow Japanese learners
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Link to="/forums">
              <Card className="h-full hover:border-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">
                      Discussion Forums
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Ask questions, share knowledge, and help each other learn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Browse Forums
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to="/groups">
              <Card className="h-full hover:border-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Study Groups</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Join study groups, track progress together, and compete on
                    leaderboards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Groups
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Global Leaderboard</CardTitle>
                  <CardDescription>
                    Top learners across the entire community
                  </CardDescription>
                </div>
                <div className="w-[180px]">
                  <Select
                    value={period}
                    onValueChange={(v: any) => setPeriod(v)}
                  >
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
              {loading && <div>Loading...</div>}
              {error && <div className="text-destructive">{error}</div>}
              {!loading && !error && (
                <div className="space-y-3">
                  {leaderboard.map((user: any, idx: number) => (
                    <Link
                      key={user.rank || idx}
                      to={`/profile/${(user.name || user.username || "user")
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, "")}`}
                      className={`block p-4 border rounded-lg flex items-center justify-between hover:border-accent transition-colors cursor-pointer ${
                        (user.rank || idx + 1) <= 3
                          ? "border-accent bg-accent/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                            (user.rank || idx + 1) === 1
                              ? "bg-yellow-500 text-white"
                              : (user.rank || idx + 1) === 2
                              ? "bg-gray-400 text-white"
                              : (user.rank || idx + 1) === 3
                              ? "bg-amber-700 text-white"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          {(user.rank || idx + 1) <= 3 ? (
                            (user.rank || idx + 1) === 1 ? (
                              <Crown className="w-6 h-6" />
                            ) : (user.rank || idx + 1) === 2 ? (
                              <Medal className="w-6 h-6" />
                            ) : (
                              <Award className="w-6 h-6" />
                            )
                          ) : (
                            user.rank || idx + 1
                          )}
                        </div>
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.avatar ||
                              (user.name || user.username || "U")[0] ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">
                            {user.name || user.username || "User"}
                          </p>
                          {user.streak != null && (
                            <p className="text-sm text-muted-foreground">
                              {user.streak} day streak
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {user.points != null && (
                          <p className="font-bold text-lg text-primary">
                            {Number(user.points).toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
