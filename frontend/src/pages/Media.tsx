import { useState } from "react";
import { Header } from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Video,
  Headphones,
  FileText,
  BookOpen,
  Play,
  Clock,
  TrendingUp,
} from "lucide-react";

// Sample media data
const mediaContent = {
  videos: [
    {
      id: 1,
      title: "Japanese Pronunciation Guide",
      duration: "15:30",
      level: "Beginner",
      views: "12.5K",
      thumbnail: "🎯",
      category: "Pronunciation",
    },
    {
      id: 2,
      title: "Daily Conversation Practice",
      duration: "22:15",
      level: "Beginner",
      views: "8.3K",
      thumbnail: "💬",
      category: "Conversation",
    },
    {
      id: 3,
      title: "Kanji Writing Techniques",
      duration: "18:45",
      level: "Intermediate",
      views: "15.2K",
      thumbnail: "✍️",
      category: "Writing",
    },
    {
      id: 4,
      title: "Grammar Essentials N5",
      duration: "25:00",
      level: "Beginner",
      views: "20.1K",
      thumbnail: "📚",
      category: "Grammar",
    },
  ],
  podcasts: [
    {
      id: 1,
      title: "Japanese Culture Stories",
      duration: "35:00",
      level: "Intermediate",
      episodes: 24,
      thumbnail: "🎙️",
      category: "Culture",
    },
    {
      id: 2,
      title: "Everyday Japanese Podcast",
      duration: "20:00",
      level: "Beginner",
      episodes: 45,
      thumbnail: "🎧",
      category: "Conversation",
    },
    {
      id: 3,
      title: "News in Slow Japanese",
      duration: "15:00",
      level: "Advanced",
      episodes: 156,
      thumbnail: "📰",
      category: "News",
    },
  ],
  articles: [
    {
      id: 1,
      title: "Understanding Particles: は vs が",
      readTime: "5 min",
      level: "Beginner",
      thumbnail: "📖",
      category: "Grammar",
    },
    {
      id: 2,
      title: "10 Common Mistakes in Japanese",
      readTime: "8 min",
      level: "Intermediate",
      thumbnail: "⚠️",
      category: "Tips",
    },
    {
      id: 3,
      title: "The History of Kanji",
      readTime: "12 min",
      level: "All Levels",
      thumbnail: "🏛️",
      category: "Culture",
    },
    {
      id: 4,
      title: "Japanese Honorifics Explained",
      readTime: "7 min",
      level: "Intermediate",
      thumbnail: "🙇",
      category: "Culture",
    },
  ],
};

export default function Media() {
  const [activeTab, setActiveTab] = useState("videos");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />

      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="mb-4">Learning Media</h1>
            <p className="text-xl text-muted-foreground">
              Videos, podcasts, and articles to enhance your Japanese
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="videos" className="gap-2">
                <Video className="w-4 h-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="podcasts" className="gap-2">
                <Headphones className="w-4 h-4" />
                Podcasts
              </TabsTrigger>
              <TabsTrigger value="articles" className="gap-2">
                <FileText className="w-4 h-4" />
                Articles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mediaContent.videos.map((video) => (
                  <Card
                    key={video.id}
                    className="group hover:border-accent transition-all overflow-hidden"
                  >
                    <div className="aspect-video bg-secondary flex items-center justify-center text-6xl border-b border-border group-hover:bg-accent/10 transition-colors">
                      {video.thumbnail}
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {video.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {video.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {video.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{video.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{video.views} views</span>
                        </div>
                      </div>
                      <Button className="w-full" variant="default">
                        <Play className="w-4 h-4 mr-2" />
                        Watch Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="podcasts">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mediaContent.podcasts.map((podcast) => (
                  <Card
                    key={podcast.id}
                    className="group hover:border-accent transition-all"
                  >
                    <div className="aspect-square bg-secondary flex items-center justify-center text-8xl border-b border-border group-hover:bg-accent/10 transition-colors">
                      {podcast.thumbnail}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{podcast.title}</CardTitle>
                      <CardDescription>
                        {podcast.episodes} episodes
                      </CardDescription>
                      <div className="flex items-center gap-2 flex-wrap pt-2">
                        <Badge variant="secondary" className="text-xs">
                          {podcast.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {podcast.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>~{podcast.duration} per episode</span>
                      </div>
                      <Button className="w-full" variant="default">
                        <Headphones className="w-4 h-4 mr-2" />
                        Listen
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="articles">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mediaContent.articles.map((article) => (
                  <Card
                    key={article.id}
                    className="group hover:border-accent transition-all"
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="text-5xl">{article.thumbnail}</div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {article.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {article.level}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span>{article.readTime} read</span>
                      </div>
                      <Button className="w-full" variant="outline">
                        Read Article
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
