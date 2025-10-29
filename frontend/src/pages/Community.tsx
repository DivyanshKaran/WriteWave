import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Medal, Award, MessageSquare, Users, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const leaderboard = [
  { rank: 1, name: "KanjiMaster2024", points: 15420, streak: 89, avatar: "K" },
  { rank: 2, name: "TokyoNinja", points: 14850, streak: 76, avatar: "T" },
  { rank: 3, name: "SakuraStudent", points: 13990, streak: 65, avatar: "S" },
  { rank: 4, name: "RamenLover", points: 12340, streak: 58, avatar: "R" },
  { rank: 5, name: "MangaReader99", points: 11520, streak: 52, avatar: "M" },
  { rank: 6, name: "JapanBound", points: 10890, streak: 47, avatar: "J" },
  { rank: 7, name: "SushiSensei", points: 9870, streak: 41, avatar: "S" },
  { rank: 8, name: "AnimeOtaku", points: 9240, streak: 38, avatar: "A" },
];

export default function Community() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-20 sm:pt-24 pb-16 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/app')}
            className="mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Mobile-first header */}
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Community Hub</h1>
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
                    <CardTitle className="text-2xl">Discussion Forums</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Ask questions, share knowledge, and help each other learn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Browse Forums</Button>
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
                    Join study groups, track progress together, and compete on leaderboards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">View Groups</Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>Top learners across the entire community this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <Link 
                    key={user.rank}
                    to={`/profile/${user.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                    className={`block p-4 border rounded-lg flex items-center justify-between hover:border-accent transition-colors cursor-pointer ${
                      user.rank <= 3 ? 'border-accent bg-accent/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                        user.rank === 1 ? 'bg-yellow-500 text-white' :
                        user.rank === 2 ? 'bg-gray-400 text-white' :
                        user.rank === 3 ? 'bg-amber-700 text-white' :
                        'bg-secondary text-foreground'
                      }`}>
                        {user.rank <= 3 ? (
                          user.rank === 1 ? <Crown className="w-6 h-6" /> :
                          user.rank === 2 ? <Medal className="w-6 h-6" /> :
                          <Award className="w-6 h-6" />
                        ) : user.rank}
                      </div>
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.streak} day streak</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">{user.points.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
