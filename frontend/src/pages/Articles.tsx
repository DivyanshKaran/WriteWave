import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useArticles as useArticlesHook } from "@/hooks/useArticles";
import { 
  ArticleFilters, 
  ArticleGrid, 
  FeaturedArticles, 
  PopularTags 
} from "@/components/articles";

// Live data via articles hook

export default function Articles() {
  const navigate = useNavigate();
  const { articles, isLoading, error } = useArticlesHook();
  const { fetchArticles } = useArticlesHook();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [showTrending, setShowTrending] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach(a => a.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [articles]);

  // Filter articles based on search and filters
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || article.tags.includes(selectedTag);
    const matchesAuthor = !selectedAuthor || article.author.username === selectedAuthor;
    const matchesTrending = !showTrending || article.trending;
    
    return matchesSearch && matchesTag && matchesAuthor && matchesTrending;
  });

  const trendingArticles = articles.filter(article => article.trending);
  const featuredArticles = articles.filter(article => article.featured);

  const authors = articles.map(article => ({
    username: article.author.username,
    name: article.author.name
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-20 sm:pt-24 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/app')}
            className="mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Header Section */}
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Articles</h1>
                <p className="text-muted-foreground text-base sm:text-lg">
                  Discover trending articles, tips, and insights from the Japanese learning community
                </p>
              </div>
              <Link to="/articles/create">
                <Button size="lg" className="w-full sm:w-auto">
                  <Plus className="w-5 h-5 mr-2" />
                  Write Article
                </Button>
              </Link>
            </div>

            {/* Search and Filters */}
            <ArticleFilters
              searchTerm={searchTerm}
              selectedTag={selectedTag}
              selectedAuthor={selectedAuthor}
              showTrending={showTrending}
              onSearchChange={setSearchTerm}
              onTagChange={setSelectedTag}
              onAuthorChange={setSelectedAuthor}
              onTrendingToggle={() => setShowTrending(!showTrending)}
              allTags={allTags}
              authors={authors}
            />
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Articles */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {showTrending ? "Trending Articles" : "All Articles"}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filteredArticles.length} articles
                </span>
              </div>

              <ArticleGrid articles={filteredArticles} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Featured Articles */}
              <FeaturedArticles articles={featuredArticles} />

              {/* Popular Tags */}
              <PopularTags 
                tags={allTags}
                selectedTag={selectedTag}
                onTagSelect={setSelectedTag}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
