import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Users, Flame } from "lucide-react";
import { Link } from "react-router-dom";

const popularForums = [
  {
    id: "n5-study-squad-grammar",
    groupId: "n5-study-squad",
    groupName: "N5 Study Squad",
    forumId: "grammar-questions",
    forumName: "Grammar Questions",
    description: "Ask and answer grammar-related questions",
    posts: 312,
    members: 45,
    trending: true,
    lastActivity: "5 minutes ago"
  },
  {
    id: "kanji-warriors-study",
    groupId: "kanji-warriors",
    groupName: "Kanji Warriors",
    forumId: "study-tips",
    forumName: "Study Tips & Resources",
    description: "Share helpful resources and study methods for kanji",
    posts: 267,
    members: 32,
    trending: true,
    lastActivity: "15 minutes ago"
  },
  {
    id: "conversation-general",
    groupId: "conversation-club",
    groupName: "Conversation Club",
    forumId: "general-discussion",
    forumName: "General Discussion",
    description: "Casual conversations about learning Japanese",
    posts: 234,
    members: 28,
    trending: true,
    lastActivity: "30 minutes ago"
  },
  {
    id: "n5-vocab",
    groupId: "n5-study-squad",
    groupName: "N5 Study Squad",
    forumId: "vocabulary",
    forumName: "Vocabulary Building",
    description: "Share new words and mnemonics",
    posts: 198,
    members: 45,
    trending: false,
    lastActivity: "1 hour ago"
  },
  {
    id: "kanji-homework",
    groupId: "kanji-warriors",
    groupName: "Kanji Warriors",
    forumId: "homework-help",
    forumName: "Homework Help",
    description: "Get help with kanji exercises and practice",
    posts: 189,
    members: 32,
    trending: false,
    lastActivity: "2 hours ago"
  },
  {
    id: "conversation-tips",
    groupId: "conversation-club",
    groupName: "Conversation Club",
    forumId: "study-tips",
    forumName: "Study Tips & Resources",
    description: "Tips for improving conversation skills",
    posts: 156,
    members: 28,
    trending: false,
    lastActivity: "3 hours ago"
  }
];

export default function Forums() {
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularForums.map((forum) => (
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
                        <CardDescription className="text-sm">{forum.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{forum.posts} posts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{forum.members} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{forum.lastActivity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
