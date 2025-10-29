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
  Share2,
  MoreVertical
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

const threadData = {
  id: 1,
  author: "SakuraLearner",
  initial: "S",
  role: "Admin",
  title: "Best way to memorize N5 vocabulary?",
  content: "I've been struggling with retaining vocabulary. What methods do you all use? I've tried flashcards but they don't seem to stick. I'm currently learning about 10 new words per day but by the next week I've forgotten half of them. Any advice would be really appreciated!",
  timeAgo: "2 hours ago",
  upvotes: 15,
  isPinned: true
};

const replies = [
  {
    id: 1,
    author: "TokyoDreamer",
    initial: "T",
    role: "Moderator",
    content: "I recommend using spaced repetition! Apps like Anki are great for this. The key is to review words just before you're about to forget them.",
    timeAgo: "2 hours ago",
    upvotes: 12,
    replies: [
      {
        id: 11,
        author: "SakuraLearner",
        initial: "S",
        role: "Admin",
        content: "Thanks! I'll give Anki a try. Do you have any deck recommendations?",
        timeAgo: "2 hours ago",
        upvotes: 3
      },
      {
        id: 12,
        author: "TokyoDreamer",
        initial: "T",
        role: "Moderator",
        content: "The Core 2k/6k deck is excellent for beginners. Start with Core 2k!",
        timeAgo: "1 hour ago",
        upvotes: 8
      }
    ]
  },
  {
    id: 2,
    author: "KanjiMaster",
    initial: "K",
    role: "Member",
    content: "What really helped me was using vocabulary in sentences. Don't just memorize isolated words - see them in context! Try writing your own example sentences.",
    timeAgo: "1 hour ago",
    upvotes: 18,
    replies: [
      {
        id: 21,
        author: "StudyBuddy",
        initial: "S",
        role: "Member",
        content: "This is such good advice! Context makes everything stick better.",
        timeAgo: "1 hour ago",
        upvotes: 5
      }
    ]
  },
  {
    id: 3,
    author: "JapanFan",
    initial: "J",
    role: "Member",
    content: "I found that watching anime with Japanese subtitles helped me a lot. You see the words being used naturally and it's more fun than just studying!",
    timeAgo: "45 minutes ago",
    upvotes: 9,
    replies: []
  },
  {
    id: 4,
    author: "VocabNinja",
    initial: "V",
    role: "Member",
    content: "Try the 'goldfish technique' - say the word out loud multiple times when you first learn it. Activating multiple senses (visual, auditory, speaking) helps with retention.",
    timeAgo: "30 minutes ago",
    upvotes: 14,
    replies: []
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

export default function GroupForumThreadDetail() {
  const { groupId, forumId } = useParams();
  const forumTitle = forumTitles[forumId || ""] || "Forum";
  const groupName = groupNames[groupId || ""] || "Study Group";
  const [replyText, setReplyText] = useState("");
  const [replyToId, setReplyToId] = useState<number | null>(null);

  const handleReply = () => {
    console.log("Replying to:", replyToId || "main thread");
    setReplyText("");
    setReplyToId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Link 
              to={`/groups/${groupId}/forums/${forumId}`} 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {forumTitle}
            </Link>
          </div>

          {/* Main Thread Post */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {threadData.initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold">{threadData.author}</span>
                      <Badge variant="secondary" className="text-xs">{threadData.role}</Badge>
                      {threadData.isPinned && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{threadData.timeAgo}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-2xl mb-4">{threadData.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">{threadData.content}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{threadData.upvotes}</span>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{replies.length} replies</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Replies Section */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold">{replies.length} Replies</h2>
            
            {replies.map((reply) => (
              <div key={reply.id} className="space-y-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="mt-1">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {reply.initial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold">{reply.author}</span>
                            <Badge variant="secondary" className="text-xs">{reply.role}</Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{reply.timeAgo}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm mb-3">{reply.content}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="gap-1 h-8">
                              <ThumbsUp className="w-3 h-3" />
                              <span className="text-xs">{reply.upvotes}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8">
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs"
                            onClick={() => setReplyToId(reply.id)}
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Nested Replies */}
                {reply.replies && reply.replies.length > 0 && (
                  <div className="ml-12 space-y-3">
                    {reply.replies.map((nestedReply) => (
                      <Card key={nestedReply.id} className="bg-muted/50">
                        <CardHeader className="py-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {nestedReply.initial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold text-sm">{nestedReply.author}</span>
                                <Badge variant="secondary" className="text-xs">{nestedReply.role}</Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{nestedReply.timeAgo}</span>
                                </div>
                              </div>
                              <p className="text-sm mb-2">{nestedReply.content}</p>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{nestedReply.upvotes}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 text-xs">
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {replyToId ? "Post a Reply" : "Add Your Comment"}
              </CardTitle>
              <CardDescription>
                {replyToId 
                  ? `Replying to a comment` 
                  : "Share your thoughts or advice"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Write your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex justify-between items-center">
                  {replyToId && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setReplyToId(null)}
                    >
                      Cancel Reply
                    </Button>
                  )}
                  <Button onClick={handleReply} className="ml-auto">
                    Post Reply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
