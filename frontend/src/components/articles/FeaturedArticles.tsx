import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

interface Article {
  id: number;
  title: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  readTime: string;
}

interface FeaturedArticlesProps {
  articles: Article[];
}

export function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Featured Articles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.slice(0, 3).map((article) => (
            <Link key={article.id} to={`/articles/${article.id}`}>
              <div className="p-3 border rounded-lg hover:border-accent transition-colors cursor-pointer">
                <h4 className="font-semibold mb-1 line-clamp-2">{article.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-xs">
                      {article.author.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span>{article.author.name}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
