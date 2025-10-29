import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Calendar, Eye, Heart, MessageCircle } from "lucide-react";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
}

interface ProfileArticlesProps {
  articles: Article[];
}

export function ProfileArticles({ articles }: ProfileArticlesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          My Articles
        </CardTitle>
        <CardDescription>
          Articles I've written to help the community learn Japanese
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="p-4 border rounded-lg hover:border-accent transition-colors cursor-pointer">
              <h4 className="font-semibold mb-2">{article.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{article.excerpt}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {article.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {article.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {article.comments}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {articles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No articles written yet</p>
              <p className="text-sm">Start sharing your knowledge with the community!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
