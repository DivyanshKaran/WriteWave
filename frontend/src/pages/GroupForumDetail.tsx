import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Pin,
  Clock,
  Share2
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

const forumThreads = [
  {
    id: 1,
    author: "SakuraLearner",
    initial: "S",
    role: "Admin",
    title: "Best way to memorize N5 vocabulary?",
    content: "I've been struggling with retaining vocabulary. What methods do you all use? I've tried flashcards but they don't seem to stick...",
    timeAgo: "2 hours ago",
    upvotes: 15,
    replies: 8,
    isPinned: true
  },
  {
    id: 2,
    author: "TokyoDreamer",
    initial: "T",
    role: "Moderator",
    title: "Weekly study session - Saturday 7PM",
    content: "Join us this Saturday for our weekly video study session! We'll be covering particles は and が.",
    timeAgo: "5 hours ago",
    upvotes: 23,
    replies: 12,
    isPinned: true
  },
  {
    id: 3,
    author: "KanjiMaster",
    initial: "K",
    role: "Member",
    title: "Confused about て-form conjugation",
    content: "Can someone explain when to use って vs って in casual speech? I keep mixing them up.",
    timeAgo: "1 day ago",
    upvotes: 8,
    replies: 5,
    isPinned: false
  },
  {
    id: 4,
    author: "StudyBuddy",
    initial: "S",
    role: "Member",
    title: "Passed my first mock exam!",
    content: "Just wanted to share that I scored 78% on my first N5 mock exam. Thank you all for the support!",
    timeAgo: "1 day ago",
    upvotes: 34,
    replies: 15,
    isPinned: false
  },
  {
    id: 5,
    author: "JapanFan",
    initial: "J",
    role: "Member",
    title: "Recommended textbooks for N5?",
    content: "I'm looking for good textbook recommendations. Currently using Genki I, but wondering if there are other good options.",
    timeAgo: "2 days ago",
    upvotes: 12,
    replies: 9,
    isPinned: false
  }
];

const forumTitles: Record<string, string> = {
  "general-discussion": "General Discussion",
  "study-tips": "Study Tips & Resources",
  "homework-help": "Homework Help",
  "grammar-questions": "Grammar Questions",
  "vocabulary": "Vocabulary Building"
};

const groupNames: Record<string, string> = {
  "n5-study-squad": "N5 Study Squad",
  "kanji-warriors": "Kanji Warriors",
  "conversation-club": "Conversation Club"
};

export default function GroupForumDetail() {
  const { groupId, forumId } = useParams();
  const forumTitle = forumTitles[forumId || ""] || "Forum";
  const groupName = groupNames[groupId || ""] || "Study Group";
  const [replyText, setReplyText] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8">
            <Link 
              to={`/groups/${groupId}`} 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {groupName}
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="mb-2">{forumTitle}</h1>
                <p className="text-muted-foreground">Share and discuss with your group</p>
              </div>
              <Button>New Thread</Button>
            </div>
          </div>

          <div className="space-y-4">
            {forumThreads.map((thread) => (
              <Link key={thread.id} to={`/groups/${groupId}/forums/${forumId}/threads/${thread.id}`}>
                <Card className="hover:border-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="mt-1">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {thread.initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold">{thread.author}</span>
                            <Badge variant="secondary" className="text-xs">{thread.role}</Badge>
                            {thread.isPinned && (
                              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary">
                                <Pin className="w-3 h-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{thread.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-xl mb-3">{thread.title}</CardTitle>
                      <CardDescription className="text-base">{thread.content}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{thread.upvotes}</span>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{thread.replies} replies</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Post a Reply</CardTitle>
              <CardDescription>Share your thoughts with the group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Write your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex justify-end">
                  <Button>Post Reply</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
