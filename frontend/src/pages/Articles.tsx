import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  ArticleFilters, 
  ArticleGrid, 
  FeaturedArticles, 
  PopularTags 
} from "@/components/articles";

// Sample articles data
const articles = [
  {
    id: 1,
    title: "Mastering Japanese Particles: A Complete Guide",
    excerpt: "Understanding the subtle differences between は and が, and when to use each particle correctly in different contexts.",
    author: {
      name: "Yuki Tanaka",
      username: "yuki_sensei",
      avatar: "YT"
    },
    tags: ["grammar", "particles", "beginner", "jlpt"],
    publishedAt: "2024-01-15",
    readTime: "8 min read",
    views: 1240,
    likes: 89,
    comments: 23,
    trending: true,
    featured: true
  },
  {
    id: 2,
    title: "The Art of Japanese Calligraphy: Stroke Order Matters",
    excerpt: "Why stroke order is crucial in Japanese writing and how it affects the beauty and readability of your characters.",
    author: {
      name: "Hiroshi Nakamura",
      username: "calligraphy_master",
      avatar: "HN"
    },
    tags: ["calligraphy", "writing", "kanji", "culture"],
    publishedAt: "2024-01-12",
    readTime: "12 min read",
    views: 980,
    likes: 67,
    comments: 15,
    trending: true,
    featured: false
  },
  {
    id: 3,
    title: "JLPT N5 Vocabulary: Essential Words for Beginners",
    excerpt: "A comprehensive list of the most important vocabulary words you need to know for the JLPT N5 exam.",
    author: {
      name: "Sakura Kimura",
      username: "jlpt_expert",
      avatar: "SK"
    },
    tags: ["vocabulary", "jlpt", "n5", "beginner"],
    publishedAt: "2024-01-10",
    readTime: "15 min read",
    views: 2100,
    likes: 156,
    comments: 45,
    trending: false,
    featured: true
  },
  {
    id: 4,
    title: "Understanding Japanese Honorifics: -san, -kun, -chan",
    excerpt: "Learn when and how to use different Japanese honorifics in various social situations.",
    author: {
      name: "Takeshi Yamamoto",
      username: "japanese_culture",
      avatar: "TY"
    },
    tags: ["honorifics", "culture", "social", "intermediate"],
    publishedAt: "2024-01-08",
    readTime: "6 min read",
    views: 750,
    likes: 42,
    comments: 12,
    trending: false,
    featured: false
  },
  {
    id: 5,
    title: "Common Japanese Mistakes English Speakers Make",
    excerpt: "Avoid these frequent pitfalls when learning Japanese and sound more natural in your conversations.",
    author: {
      name: "Maya Suzuki",
      username: "mistake_buster",
      avatar: "MS"
    },
    tags: ["mistakes", "pronunciation", "common", "tips"],
    publishedAt: "2024-01-05",
    readTime: "10 min read",
    views: 1650,
    likes: 98,
    comments: 28,
    trending: true,
    featured: false
  },
  {
    id: 6,
    title: "Japanese Business Etiquette: Do's and Don'ts",
    excerpt: "Essential etiquette rules for professional settings in Japan, from bowing to business card exchange.",
    author: {
      name: "Kenji Sato",
      username: "business_japan",
      avatar: "KS"
    },
    tags: ["business", "etiquette", "professional", "culture"],
    publishedAt: "2024-01-03",
    readTime: "14 min read",
    views: 890,
    likes: 54,
    comments: 18,
    trending: false,
    featured: false
  }
];

const allTags = [
  "grammar", "particles", "beginner", "jlpt", "calligraphy", "writing", 
  "kanji", "culture", "vocabulary", "n5", "honorifics", "social", 
  "intermediate", "mistakes", "pronunciation", "common", "tips", 
  "business", "etiquette", "professional"
];

export default function Articles() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [showTrending, setShowTrending] = useState(true);

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
