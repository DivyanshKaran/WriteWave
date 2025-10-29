import { ArticleCard } from "./ArticleCard";
import { LoadingGrid } from "@/components/loading";

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

interface ArticleGridProps {
  articles: Article[];
  isLoading?: boolean;
}

export function ArticleGrid({ articles, isLoading = false }: ArticleGridProps) {
  if (isLoading) {
    return <LoadingGrid count={3} />;
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <h3 className="text-lg font-semibold mb-2">No articles found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
