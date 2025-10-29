import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample vocabulary data - will be replaced with backend data
const vocabularyData = [
  { 
    id: 1, 
    word: "日本", 
    reading: "にほん", 
    meaning: "Japan", 
    level: "N5",
    category: "Country",
    example: "日本は美しい国です。",
    exampleReading: "にほんはうつくしいくにです。",
    exampleMeaning: "Japan is a beautiful country."
  },
  { 
    id: 2, 
    word: "食べる", 
    reading: "たべる", 
    meaning: "to eat", 
    level: "N5",
    category: "Verb",
    example: "朝ご飯を食べます。",
    exampleReading: "あさごはんをたべます。",
    exampleMeaning: "I eat breakfast."
  },
  { 
    id: 3, 
    word: "学校", 
    reading: "がっこう", 
    meaning: "school", 
    level: "N5",
    category: "Place",
    example: "学校に行きます。",
    exampleReading: "がっこうにいきます。",
    exampleMeaning: "I go to school."
  },
  { 
    id: 4, 
    word: "友達", 
    reading: "ともだち", 
    meaning: "friend", 
    level: "N5",
    category: "Person",
    example: "友達と遊びます。",
    exampleReading: "ともだちとあそびます。",
    exampleMeaning: "I play with friends."
  },
  { 
    id: 5, 
    word: "今日", 
    reading: "きょう", 
    meaning: "today", 
    level: "N5",
    category: "Time",
    example: "今日は金曜日です。",
    exampleReading: "きょうはきんようびです。",
    exampleMeaning: "Today is Friday."
  },
  { 
    id: 6, 
    word: "電車", 
    reading: "でんしゃ", 
    meaning: "train", 
    level: "N5",
    category: "Transportation",
    example: "電車で行きます。",
    exampleReading: "でんしゃでいきます。",
    exampleMeaning: "I go by train."
  },
  { 
    id: 7, 
    word: "勉強", 
    reading: "べんきょう", 
    meaning: "study", 
    level: "N4",
    category: "Education",
    example: "日本語を勉強します。",
    exampleReading: "にほんごをべんきょうします。",
    exampleMeaning: "I study Japanese."
  },
  { 
    id: 8, 
    word: "図書館", 
    reading: "としょかん", 
    meaning: "library", 
    level: "N4",
    category: "Place",
    example: "図書館で本を読みます。",
    exampleReading: "としょかんでほんをよみます。",
    exampleMeaning: "I read books at the library."
  },
  { 
    id: 9, 
    word: "美味しい", 
    reading: "おいしい", 
    meaning: "delicious", 
    level: "N5",
    category: "Adjective",
    example: "このラーメンは美味しいです。",
    exampleReading: "このらーめんはおいしいです。",
    exampleMeaning: "This ramen is delicious."
  },
  { 
    id: 10, 
    word: "買い物", 
    reading: "かいもの", 
    meaning: "shopping", 
    level: "N5",
    category: "Activity",
    example: "買い物に行きます。",
    exampleReading: "かいものにいきます。",
    exampleMeaning: "I go shopping."
  },
  { 
    id: 11, 
    word: "約束", 
    reading: "やくそく", 
    meaning: "promise, appointment", 
    level: "N4",
    category: "Abstract",
    example: "友達と約束があります。",
    exampleReading: "ともだちとやくそくがあります。",
    exampleMeaning: "I have an appointment with a friend."
  },
  { 
    id: 12, 
    word: "散歩", 
    reading: "さんぽ", 
    meaning: "walk, stroll", 
    level: "N4",
    category: "Activity",
    example: "公園で散歩します。",
    exampleReading: "こうえんでさんぽします。",
    exampleMeaning: "I take a walk in the park."
  },
];

const levels = ["All", "N5", "N4", "N3", "N2", "N1"];
const categories = ["All", "Verb", "Adjective", "Noun", "Place", "Time", "Person", "Activity", "Abstract"];

export default function Vocabulary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());

  const filteredVocabulary = vocabularyData.filter(item => {
    const matchesSearch = 
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reading.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = selectedLevel === "All" || item.level === selectedLevel;
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  const toggleBookmark = (id: number) => {
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
                  Found {filteredVocabulary.length} words
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredVocabulary.map((item) => (
              <Card key={item.id} className="group hover:border-accent transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-3xl">{item.word}</CardTitle>
                        <Badge variant="secondary">{item.level}</Badge>
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      </div>
                      <CardDescription className="text-lg">{item.reading}</CardDescription>
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
                      <p className="font-medium mb-1">{item.meaning}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Example Sentence</p>
                    <p className="text-lg font-medium">{item.example}</p>
                    <p className="text-sm text-muted-foreground">{item.exampleReading}</p>
                    <p className="text-sm">{item.exampleMeaning}</p>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Star className="w-4 h-4 mr-2" />
                    Practice This Word
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVocabulary.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No vocabulary found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
