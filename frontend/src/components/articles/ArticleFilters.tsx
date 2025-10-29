import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, User, TrendingUp } from "lucide-react";

interface ArticleFiltersProps {
  searchTerm: string;
  selectedTag: string;
  selectedAuthor: string;
  showTrending: boolean;
  onSearchChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onTrendingToggle: () => void;
  allTags: string[];
  authors: Array<{ username: string; name: string }>;
}

export function ArticleFilters({
  searchTerm,
  selectedTag,
  selectedAuthor,
  showTrending,
  onSearchChange,
  onTagChange,
  onAuthorChange,
  onTrendingToggle,
  allTags,
  authors,
}: ArticleFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select
                value={selectedTag}
                onChange={(e) => onTagChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select
                value={selectedAuthor}
                onChange={(e) => onAuthorChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="">All Authors</option>
                {authors.map(author => (
                  <option key={author.username} value={author.username}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant={showTrending ? "default" : "outline"}
              onClick={onTrendingToggle}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
