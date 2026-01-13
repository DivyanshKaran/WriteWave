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
import { useEffect, useState } from "react";
import { communityService } from "@/lib/api-client";

// Loaded from API
const threadData: any = {} as any;
let replies: any[] = [];

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
  const { groupId, forumId, threadId } = useParams();
  const forumTitle = forumTitles[forumId || ""] || "Forum";
  const groupName = groupNames[groupId || ""] || "Study Group";
  const [replyText, setReplyText] = useState("");
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!threadId) return;
      setLoading(true);
      setError(null);
      try {
        const p = await communityService.getPost(threadId);
        setPost(p.data);
        const c = await communityService.getPostComments(threadId);
        setComments(c.data || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load thread');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [threadId]);

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
          {loading && <Card className="p-6 mb-6">Loading...</Card>}
          {error && <div className="text-destructive mb-6">{error}</div>}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(post?.author || 'U').toString().charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold">{post?.author || 'User'}</span>
                      {post?.role && <Badge variant="secondary" className="text-xs">{post.role}</Badge>}
                      {post?.isPinned && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{post?.createdAt || ''}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-2xl mb-4">{post?.title || 'Thread'}</CardTitle>
              <CardDescription className="text-base leading-relaxed">{post?.content || post?.text}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post?.upvotes ?? 0}</span>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{comments.length} replies</span>
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
            <h2 className="text-xl font-bold">{comments.length} Replies</h2>
            
            {comments.map((reply) => (
              <div key={reply.id} className="space-y-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="mt-1">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {(reply.author || 'U').toString().charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold">{reply.author || 'User'}</span>
                            {reply.role && <Badge variant="secondary" className="text-xs">{reply.role}</Badge>}
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{reply.createdAt || ''}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm mb-3">{reply.content || reply.text}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="gap-1 h-8">
                              <ThumbsUp className="w-3 h-3" />
                              <span className="text-xs">{reply.upvotes ?? 0}</span>
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
                                {(nestedReply.author || 'U').toString().charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold text-sm">{nestedReply.author || 'User'}</span>
                                {nestedReply.role && <Badge variant="secondary" className="text-xs">{nestedReply.role}</Badge>}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{nestedReply.createdAt || ''}</span>
                                </div>
                              </div>
                              <p className="text-sm mb-2">{nestedReply.content || nestedReply.text}</p>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{nestedReply.upvotes ?? 0}</span>
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
