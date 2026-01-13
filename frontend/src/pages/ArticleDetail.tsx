import { Header } from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  User,
  Tag,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { articlesService } from "@/lib/api-client";
import { formatAndSanitizeContent } from "@/lib/sanitize";

// Mock article data for fallback
const MOCK_ARTICLE = {
  id: "mock-1",
  title: "Understanding Japanese Particles",
  content: `# Understanding Japanese Particles

Japanese particles (助詞, joshi) are small words that indicate the relationship between words in a sentence. They are essential for understanding Japanese grammar and are often one of the most challenging aspects for learners.

## The Most Important Particles

### は (wa) - Topic Marker

The particle は marks the topic of the sentence. It's pronounced "wa" but written with the hiragana character は.

**Examples:**
- 私は学生です。(Watashi wa gakusei desu.) - I am a student.
- 今日は暑いです。(Kyou wa atsui desu.) - Today is hot.

### が (ga) - Subject Marker

The particle が marks the subject of the sentence and is often used to introduce new information.

**Examples:**
- 猫がいます。(Neko ga imasu.) - There is a cat.
- 雨が降っています。(Ame ga futte imasu.) - It is raining.

## Key Differences Between は and が

Understanding when to use は vs が is crucial:

1. **は** is used for known information (the topic)
2. **が** is used for new information (the subject)

**Example:**
- 田中さんは先生です。(Tanaka-san wa sensei desu.) - Mr. Tanaka is a teacher.
- 田中さんが先生です。(Tanaka-san ga sensei desu.) - Mr. Tanaka is the teacher (among others).

## Other Essential Particles

### を (wo) - Direct Object Marker

Marks the direct object of a transitive verb.

**Examples:**
- 本を読みます。(Hon wo yomimasu.) - I read a book.
- コーヒーを飲みます。(Koohii wo nomimasu.) - I drink coffee.

### に (ni) - Direction/Time Marker

Indicates direction, time, or the indirect object.

**Examples:**
- 学校に行きます。(Gakkou ni ikimasu.) - I go to school.
- 三時に会いましょう。(San-ji ni aimashou.) - Let's meet at 3 o'clock.

### で (de) - Location/Means Marker

Indicates the location where an action takes place or the means by which something is done.

**Examples:**
- 図書館で勉強します。(Toshokan de benkyou shimasu.) - I study at the library.
- 電車で行きます。(Densha de ikimasu.) - I go by train.

## Practice Tips

1. **Start with basic sentences** using は and が
2. **Pay attention to context** when choosing particles
3. **Practice with real examples** from Japanese media
4. **Don't worry about perfection** - even native speakers sometimes struggle with particles

## Common Mistakes to Avoid

- Don't always use は for "I" - sometimes が is more appropriate
- Remember that を is pronounced "o" not "wo"
- Don't confuse に and で for location markers

## Conclusion

Mastering Japanese particles takes time and practice. Start with the basics and gradually build your understanding through exposure to real Japanese content. Remember that particles are the glue that holds Japanese sentences together, so investing time in learning them will greatly improve your overall Japanese ability.

Keep practicing, and don't be discouraged by mistakes - they're part of the learning process!`,
  author: {
    name: "Yuki Tanaka",
    username: "yuki_sensei",
    avatar: "YT",
    bio: "Japanese language teacher with 10+ years of experience. Specializes in grammar and JLPT preparation.",
    followers: 1250,
    articles: 45,
  },
  tags: ["grammar", "particles", "beginner", "jlpt"],
  publishedAt: "2024-01-15T10:30:00Z",
  readTime: "8 min read",
  views: 1240,
  likes: 89,
  comments: 23,
  trending: true,
  featured: true,
};

type Article = {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
    bio?: string;
    followers?: number;
    articles?: number;
  };
  tags: string[];
  publishedAt: string;
  readTime?: string;
  views?: number;
  likes: number;
  comments?: number;
  trending?: boolean;
  featured?: boolean;
};

export default function ArticleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [articleData, setArticleData] = useState<Article | null>(null);

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      try {
        const response = await articlesService.getArticle(id);
        setArticleData(response.data as Article);
      } catch (err) {
        console.error("Failed to fetch article:", err);
        // Use mock data as fallback
        setArticleData(MOCK_ARTICLE as Article);
      }
    };
    fetchArticle();
  }, [id]);

  const handleLike = async () => {
    if (!id) return;
    try {
      await articlesService.likeArticle(id);
      setIsLiked((v) => !v);
      setArticleData((prev) =>
        prev ? { ...prev, likes: prev.likes + (isLiked ? -1 : 1) } : prev
      );
    } catch {
      /* empty */
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (!articleData) return;
    if (navigator.share) {
      navigator.share({
        title: articleData.title,
        text: articleData.content.substring(0, 100) + "...",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!articleData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header isAuthenticated />
        <main className="flex-1 pt-20 sm:pt-24 px-3 sm:px-4">
          <div className="container mx-auto max-w-4xl">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />

      <main className="flex-1 pt-20 sm:pt-24 px-3 sm:px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/articles")}
            className="mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>

          {/* Article Header */}
          <Card className="mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                {articleData.trending && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
                {articleData.featured && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {articleData.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="text-lg">
                      {articleData.author.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{articleData.author.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{articleData.author.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(articleData.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {articleData.readTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {articleData.views?.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {articleData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center gap-2"
                >
                  <Heart
                    className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                  />
                  {isLiked ? articleData.likes + 1 : articleData.likes}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {articleData.comments}
                </Button>

                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={handleBookmark}
                  className="flex items-center gap-2"
                >
                  <Bookmark
                    className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                  {isBookmarked ? "Saved" : "Save"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Article Content */}
          <Card className="mb-8">
            <CardContent className="p-6 sm:p-8">
              <div
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: formatAndSanitizeContent(articleData.content),
                }}
              />
            </CardContent>
          </Card>

          {/* Author Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                About the Author
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-xl">
                    {articleData.author.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {articleData.author.name}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    @{articleData.author.username}
                  </p>
                  <p className="text-sm mb-4">{articleData.author.bio}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {articleData.author.followers?.toLocaleString()} followers
                    </span>
                    <span>{articleData.author.articles} articles</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Follow
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Related Articles</CardTitle>
              <CardDescription>
                You might also be interested in these articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Related articles will appear here.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
