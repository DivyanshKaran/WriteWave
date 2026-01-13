import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  BookOpen, 
  Star,
  Volume2,
  Bookmark,
  Filter,
  ArrowLeft
} from "lucide-react";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVocabulary } from "@/hooks/useContent";

type VocabItem = {
  id: string | number;
  word: string;
  reading?: string;
  meaning?: string;
  level?: string;
  category?: string;
  example?: string;
  exampleReading?: string;
  exampleMeaning?: string;
};

const levels = ["All", "N5", "N4", "N3", "N2", "N1"];

export default function Vocabulary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarked, setBookmarked] = useState<Set<string | number>>(new Set());
  const params: any = useMemo(() => {
    const p: any = {};
    if (searchQuery.trim()) p.q = searchQuery.trim();
    if (selectedLevel !== "All") p.level = selectedLevel;
    if (selectedCategory !== "All") p.category = selectedCategory;
    return p;
  }, [searchQuery, selectedLevel, selectedCategory]);

  const { data, isLoading, error } = useVocabulary(params);
  const items: VocabItem[] = (data || []).map((v: any) => ({
    id: v.id ?? v.word,
    word: v.word || v.term || v.kanji || "",
    reading: v.reading || v.kana,
    meaning: v.meaning || v.translation,
    level: v.level || v.jlpt,
    category: v.category,
    example: v.example,
    exampleReading: v.exampleReading,
    exampleMeaning: v.exampleMeaning,
  }));

  const categories = useMemo(() => {
    const setC = new Set<string>();
    items.forEach(i => i.category && setC.add(i.category));
    return ["All", ...Array.from(setC)];
  }, [items]);

  const toggleBookmark = (id: string | number) => {
    setBookmarked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-20 sm:pt-24 pb-16 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/app')}
            className="mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Mobile-first header */}
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Vocabulary</h1>
            <p className="text-sm sm:text-base md:text-xl text-muted-foreground">
              Build your Japanese word knowledge
            </p>
          </div>

          {/* Filters Section */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Search & Filter
              </CardTitle>
              <CardDescription>Find the vocabulary you want to study</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vocabulary..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select JLPT Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-border gap-2">
                <p className="text-sm text-muted-foreground">
                  Found {items.length} words
                </p>
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery("");
                  setSelectedLevel("All");
                  setSelectedCategory("All");
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vocabulary Grid */}
          {isLoading && <Card className="p-6">Loading...</Card>}
          {error && (
            <ErrorBanner
              message={(error as any)?.message || 'Failed to load vocabulary'}
              onRetry={() => window.location.reload()}
            />
          )}
          {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {items.map((item) => (
              <Card key={item.id} className="group hover:border-accent transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-3xl">{item.word}</CardTitle>
                        {item.level && <Badge variant="secondary">{item.level}</Badge>}
                        {item.category && <Badge variant="outline" className="text-xs">{item.category}</Badge>}
                      </div>
                      {item.reading && <CardDescription className="text-lg">{item.reading}</CardDescription>}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleBookmark(item.id)}
                        className={bookmarked.has(item.id) ? "text-primary" : ""}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarked.has(item.id) ? "fill-current" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                    <div>
                      {item.meaning && <p className="font-medium mb-1">{item.meaning}</p>}
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Example Sentence</p>
                    {item.example && <p className="text-lg font-medium">{item.example}</p>}
                    {item.exampleReading && <p className="text-sm text-muted-foreground">{item.exampleReading}</p>}
                    {item.exampleMeaning && <p className="text-sm">{item.exampleMeaning}</p>}
                  </div>

                  <Button className="w-full" variant="outline">
                    <Star className="w-4 h-4 mr-2" />
                    Practice This Word
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <EmptyState
              icon={<Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />}
              title="No vocabulary found"
              description="Try adjusting your search or filters"
            />
          )}
        </div>
      </main>
    </div>
  );
}
