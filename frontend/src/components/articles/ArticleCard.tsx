import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { TrendingUp, Calendar, Clock, Eye, Heart, MessageCircle } from "lucide-react";
import { OptimizedImage } from "@/components/performance";
import { withMemo } from "@/hooks/usePerformance";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  tags: string[];
  publishedAt: string;
  readTime: string;
  views: number;
  likes: number;
  comments: number;
  trending: boolean;
  featured: boolean;
}

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard = withMemo<ArticleCardProps>(({ article }: ArticleCardProps) => {
  return (
    <Link to={`/articles/${article.id}`}>
      <Card className="hover:border-accent transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {article.trending && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
                {article.featured && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Featured
                  </Badge>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">{article.excerpt}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{article.tags.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {article.author.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span>{article.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.readTime}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
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
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
