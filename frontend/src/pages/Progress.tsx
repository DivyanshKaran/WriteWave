import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Flame, 
  Award, 
  TrendingUp, 
  BookOpen,
  Calendar,
  Clock,
  Zap,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart as ReLineChart,
  Line,
} from "recharts";

// Sample data - will be replaced with backend data
const progressData = {
  overallStats: {
    totalCharacters: 184,
    totalVocabulary: 342,
    studyStreak: 12,
    totalStudyTime: 2580, // minutes
    lastStudyDate: "2025-10-18"
  },
  categoryProgress: {
    hiragana: { learned: 46, total: 46, percentage: 100 },
    katakana: { learned: 46, total: 46, percentage: 100 },
    kanji: { learned: 92, total: 2136, percentage: 4.3 },
  },
  jlptProgress: {
    N5: { kanji: 80, vocabulary: 800, kanjiProgress: 80, vocabProgress: 85 },
    N4: { kanji: 170, vocabulary: 1500, kanjiProgress: 12, vocabProgress: 8 },
    N3: { kanji: 370, vocabulary: 3750, kanjiProgress: 0, vocabProgress: 0 },
    N2: { kanji: 415, vocabulary: 6000, kanjiProgress: 0, vocabProgress: 0 },
    N1: { kanji: 1165, vocabulary: 10000, kanjiProgress: 0, vocabProgress: 0 },
  },
  recentAchievements: [
    { title: "First Streak", description: "Studied for 7 days in a row", date: "2025-10-11", icon: Flame },
    { title: "Kanji Master N5", description: "Learned all N5 kanji", date: "2025-10-15", icon: Award },
    { title: "Century Club", description: "Learned 100+ characters", date: "2025-10-17", icon: Target },
  ],
  weeklyActivity: [
    { day: "Mon", minutes: 45 },
    { day: "Tue", minutes: 60 },
    { day: "Wed", minutes: 30 },
    { day: "Thu", minutes: 75 },
    { day: "Fri", minutes: 50 },
    { day: "Sat", minutes: 90 },
    { day: "Sun", minutes: 40 },
  ]
};

export default function Progress() {
  const navigate = useNavigate();
  const { overallStats, jlptProgress, recentAchievements, weeklyActivity } = progressData;
  const maxMinutes = Math.max(...weeklyActivity.map(d => d.minutes));


  const weeklyChartConfig = {
    minutes: { label: "Minutes", color: "hsl(var(--primary))" },
  } as const;

  const jlptChartData = Object.entries(jlptProgress).map(([level, data]) => ({
    level,
    Kanji: data.kanjiProgress,
    Vocabulary: data.vocabProgress,
  }));

  const jlptChartConfig = {
    Kanji: { label: "Kanji", color: "hsl(var(--primary))" },
    Vocabulary: { label: "Vocabulary", color: "hsl(var(--accent))" },
  } as const;

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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Your Progress</h1>
            <p className="text-sm sm:text-base md:text-xl text-muted-foreground">
              Track your learning journey and achievements
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Characters Learned</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{overallStats.totalCharacters}</div>
                <p className="text-xs text-muted-foreground mt-1">Hiragana, Katakana & Kanji</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{overallStats.studyStreak}</div>
                <p className="text-xs text-muted-foreground mt-1">Days in a row</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Vocabulary</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{overallStats.totalVocabulary}</div>
                <p className="text-xs text-muted-foreground mt-1">Words mastered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{Math.floor(overallStats.totalStudyTime / 60)}h</div>
                <p className="text-xs text-muted-foreground mt-1">Total hours studied</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="jlpt">JLPT Levels</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Weekly Activity (Line Chart) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    This Week's Activity
                  </CardTitle>
                  <CardDescription>Daily study time in minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={weeklyChartConfig} className="w-full">
                    <ReLineChart data={weeklyActivity} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={28} />
                      <Line type="monotone" dataKey="minutes" stroke="var(--color-minutes)" strokeWidth={2} dot={{ r: 3 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </ReLineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jlpt" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">JLPT Progress</CardTitle>
                    <Badge variant="outline" className="text-xs px-2 py-0.5">Per Level</Badge>
                  </div>
                  <CardDescription>Compare Kanji and Vocabulary progress across levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={jlptChartConfig} className="w-full">
                    <ReBarChart data={jlptChartData} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={28} domain={[0, 100]} />
                      <Bar dataKey="Kanji" fill="var(--color-Kanji)" radius={4} />
                      <Bar dataKey="Vocabulary" fill="var(--color-Vocabulary)" radius={4} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </ReBarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Recent Achievements
                  </CardTitle>
                  <CardDescription>Milestones you've unlocked</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentAchievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <div 
                        key={index}
                        className="flex items-start gap-4 p-4 border border-border rounded-lg hover:border-accent transition-colors"
                      >
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold mb-1">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{achievement.date}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          <Zap className="w-3 h-3 mr-1" />
                          +50 XP
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
