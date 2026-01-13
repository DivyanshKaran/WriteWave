import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Search, 
  Star,
  Filter,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useMemo, useState } from "react";
import { useGrammar } from "@/hooks/useContent";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const grammarPoints = [
  // N5 Level
  {
    id: 1,
    pattern: "です (desu)",
    meaning: "To be (polite)",
    level: "N5",
    category: "Basic",
    explanation: "Used to make statements polite. Comes at the end of sentences.",
    examples: [
      { japanese: "学生です。", romaji: "Gakusei desu.", english: "I am a student." },
      { japanese: "これは本です。", romaji: "Kore wa hon desu.", english: "This is a book." }
    ],
    bookmarked: false
  },
  {
    id: 2,
    pattern: "は (wa) - Topic Marker",
    meaning: "Topic particle",
    level: "N5",
    category: "Particles",
    explanation: "Marks the topic of the sentence. Shows what you're talking about.",
    examples: [
      { japanese: "私は日本人です。", romaji: "Watashi wa nihonjin desu.", english: "I am Japanese." },
      { japanese: "これは何ですか。", romaji: "Kore wa nan desu ka.", english: "What is this?" }
    ],
    bookmarked: true
  },
  {
    id: 3,
    pattern: "を (wo/o) - Object Marker",
    meaning: "Direct object particle",
    level: "N5",
    category: "Particles",
    explanation: "Marks the direct object of an action. Shows what receives the action.",
    examples: [
      { japanese: "本を読みます。", romaji: "Hon wo yomimasu.", english: "I read a book." },
      { japanese: "コーヒーを飲みます。", romaji: "Koohii wo nomimasu.", english: "I drink coffee." }
    ],
    bookmarked: false
  },
  {
    id: 4,
    pattern: "に (ni) - Location/Time",
    meaning: "Location, time, direction particle",
    level: "N5",
    category: "Particles",
    explanation: "Indicates location of existence, time, or direction of movement.",
    examples: [
      { japanese: "東京に住んでいます。", romaji: "Tokyo ni sunde imasu.", english: "I live in Tokyo." },
      { japanese: "7時に起きます。", romaji: "Shichi-ji ni okimasu.", english: "I wake up at 7 o'clock." }
    ],
    bookmarked: false
  },
  {
    id: 5,
    pattern: "で (de) - Location of Action",
    meaning: "Location of action, means particle",
    level: "N5",
    category: "Particles",
    explanation: "Indicates where an action takes place or the means by which something is done.",
    examples: [
      { japanese: "図書館で勉強します。", romaji: "Toshokan de benkyou shimasu.", english: "I study at the library." },
      { japanese: "バスで行きます。", romaji: "Basu de ikimasu.", english: "I go by bus." }
    ],
    bookmarked: false
  },
  {
    id: 6,
    pattern: "か (ka) - Question Marker",
    meaning: "Question particle",
    level: "N5",
    category: "Basic",
    explanation: "Added to the end of a sentence to make it a question.",
    examples: [
      { japanese: "これは何ですか。", romaji: "Kore wa nan desu ka.", english: "What is this?" },
      { japanese: "日本人ですか。", romaji: "Nihonjin desu ka.", english: "Are you Japanese?" }
    ],
    bookmarked: false
  },
  {
    id: 7,
    pattern: "ます (masu) Form",
    meaning: "Polite verb ending",
    level: "N5",
    category: "Verbs",
    explanation: "Polite, non-past verb form. Used in formal situations.",
    examples: [
      { japanese: "食べます。", romaji: "Tabemasu.", english: "I eat / I will eat." },
      { japanese: "行きます。", romaji: "Ikimasu.", english: "I go / I will go." }
    ],
    bookmarked: true
  },
  {
    id: 8,
    pattern: "ません (masen) - Negative",
    meaning: "Polite negative verb ending",
    level: "N5",
    category: "Verbs",
    explanation: "Negates verbs in polite form.",
    examples: [
      { japanese: "食べません。", romaji: "Tabemasen.", english: "I don't eat." },
      { japanese: "行きません。", romaji: "Ikimasen.", english: "I don't go." }
    ],
    bookmarked: false
  },
  {
    id: 9,
    pattern: "ました (mashita) - Past",
    meaning: "Polite past tense",
    level: "N5",
    category: "Verbs",
    explanation: "Changes verbs to past tense in polite form.",
    examples: [
      { japanese: "食べました。", romaji: "Tabemashita.", english: "I ate." },
      { japanese: "行きました。", romaji: "Ikimashita.", english: "I went." }
    ],
    bookmarked: false
  },
  {
    id: 10,
    pattern: "て-form (te-form)",
    meaning: "Verb connector form",
    level: "N5",
    category: "Verbs",
    explanation: "Connects verbs, makes requests, creates progressive tense.",
    examples: [
      { japanese: "本を読んでください。", romaji: "Hon wo yonde kudasai.", english: "Please read the book." },
      { japanese: "食べています。", romaji: "Tabete imasu.", english: "I am eating." }
    ],
    bookmarked: true
  },
  // N4 Level
  {
    id: 11,
    pattern: "〜たい (tai)",
    meaning: "Want to (do something)",
    level: "N4",
    category: "Desires",
    explanation: "Express desire to do something. Conjugates like an i-adjective.",
    examples: [
      { japanese: "日本に行きたいです。", romaji: "Nihon ni ikitai desu.", english: "I want to go to Japan." },
      { japanese: "寿司を食べたい。", romaji: "Sushi wo tabetai.", english: "I want to eat sushi." }
    ],
    bookmarked: false
  },
  {
    id: 12,
    pattern: "〜ている (te iru)",
    meaning: "Progressive / Continuous action",
    level: "N4",
    category: "Verbs",
    explanation: "Indicates ongoing action or resulting state.",
    examples: [
      { japanese: "今、勉強しています。", romaji: "Ima, benkyou shite imasu.", english: "I am studying now." },
      { japanese: "結婚しています。", romaji: "Kekkon shite imasu.", english: "I am married." }
    ],
    bookmarked: false
  },
  {
    id: 13,
    pattern: "〜てください (te kudasai)",
    meaning: "Please do",
    level: "N4",
    category: "Requests",
    explanation: "Polite way to make requests or give instructions.",
    examples: [
      { japanese: "ここに座ってください。", romaji: "Koko ni suwatte kudasai.", english: "Please sit here." },
      { japanese: "ゆっくり話してください。", romaji: "Yukkuri hanashite kudasai.", english: "Please speak slowly." }
    ],
    bookmarked: false
  },
  {
    id: 14,
    pattern: "〜ないでください (naide kudasai)",
    meaning: "Please don't",
    level: "N4",
    category: "Requests",
    explanation: "Polite negative request.",
    examples: [
      { japanese: "写真を撮らないでください。", romaji: "Shashin wo toranaide kudasai.", english: "Please don't take photos." },
      { japanese: "忘れないでください。", romaji: "Wasurenaide kudasai.", english: "Please don't forget." }
    ],
    bookmarked: false
  },
  {
    id: 15,
    pattern: "〜たら (tara) - Conditional",
    meaning: "If / When",
    level: "N4",
    category: "Conditionals",
    explanation: "Conditional form. Used for 'if' statements and temporal 'when'.",
    examples: [
      { japanese: "雨が降ったら、行きません。", romaji: "Ame ga futtara, ikimasen.", english: "If it rains, I won't go." },
      { japanese: "家に着いたら、電話します。", romaji: "Ie ni tsuitara, denwa shimasu.", english: "When I get home, I'll call." }
    ],
    bookmarked: true
  },
  // N3 Level
  {
    id: 16,
    pattern: "〜ば (ba) - Conditional",
    meaning: "If (conditional)",
    level: "N3",
    category: "Conditionals",
    explanation: "Conditional form expressing 'if'. More formal than たら.",
    examples: [
      { japanese: "時間があれば、行きます。", romaji: "Jikan ga areba, ikimasu.", english: "If I have time, I'll go." },
      { japanese: "安ければ、買います。", romaji: "Yasukereba, kaimasu.", english: "If it's cheap, I'll buy it." }
    ],
    bookmarked: false
  },
  {
    id: 17,
    pattern: "〜のに (noni)",
    meaning: "Even though / Although",
    level: "N3",
    category: "Contrast",
    explanation: "Expresses disappointment or unexpected results.",
    examples: [
      { japanese: "勉強したのに、合格しなかった。", romaji: "Benkyou shita noni, goukaku shinakatta.", english: "Even though I studied, I didn't pass." },
      { japanese: "約束したのに、来なかった。", romaji: "Yakusoku shita noni, konakatta.", english: "Even though we promised, he didn't come." }
    ],
    bookmarked: false
  },
  {
    id: 18,
    pattern: "〜ように (you ni)",
    meaning: "In order to / So that",
    level: "N3",
    category: "Purpose",
    explanation: "Expresses purpose or desired outcome.",
    examples: [
      { japanese: "忘れないように、メモしました。", romaji: "Wasurenai you ni, memo shimashita.", english: "I made a note so I wouldn't forget." },
      { japanese: "早く起きられるように、早く寝ます。", romaji: "Hayaku okirareru you ni, hayaku nemasu.", english: "I go to bed early so I can wake up early." }
    ],
    bookmarked: false
  },
  {
    id: 19,
    pattern: "〜そう (sou) - Appearance",
    meaning: "Looks like / Seems",
    level: "N3",
    category: "Appearance",
    explanation: "Expresses appearance or how something looks.",
    examples: [
      { japanese: "美味しそうです。", romaji: "Oishisou desu.", english: "It looks delicious." },
      { japanese: "雨が降りそうです。", romaji: "Ame ga furisou desu.", english: "It looks like it will rain." }
    ],
    bookmarked: true
  },
  {
    id: 20,
    pattern: "〜らしい (rashii)",
    meaning: "Apparently / I heard",
    level: "N3",
    category: "Hearsay",
    explanation: "Expresses information heard from others.",
    examples: [
      { japanese: "彼は日本人らしいです。", romaji: "Kare wa nihonjin rashii desu.", english: "Apparently he's Japanese." },
      { japanese: "明日は雨らしい。", romaji: "Ashita wa ame rashii.", english: "I heard it will rain tomorrow." }
    ],
    bookmarked: false
  }
];

export default function Grammar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});

  const toggleBookmark = (id: number) => {
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const params = useMemo(() => ({
    q: searchQuery || undefined,
    level: selectedLevel !== 'all' ? selectedLevel : undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
  }), [searchQuery, selectedLevel, selectedCategory]);
  const { data, isLoading, error } = useGrammar(params as any);
  const filteredGrammar: any[] = (data || []) as any[];

  const categories = useMemo(() => ["all"], []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/app')}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-12">
            <h1 className="mb-4">Grammar Guide</h1>
            <p className="text-xl text-muted-foreground">
              Master Japanese grammar patterns from beginner to advanced
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search grammar patterns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="JLPT Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="N5">N5</SelectItem>
                  <SelectItem value="N4">N4</SelectItem>
                  <SelectItem value="N3">N3</SelectItem>
                  <SelectItem value="N2">N2</SelectItem>
                  <SelectItem value="N1">N1</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredGrammar.length} grammar {filteredGrammar.length === 1 ? 'pattern' : 'patterns'}
            </p>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>

          {/* Grammar Points Grid */}
          {isLoading && <Card className="p-6 mb-6">Loading...</Card>}
          {error && <div className="text-destructive mb-6">{(error as any)?.message || 'Failed to load grammar'}</div>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGrammar.map((point) => (
              <Card key={point.id} className="hover:border-accent transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{point.level}</Badge>
                        <Badge variant="outline">{point.category}</Badge>
                      </div>
                      <CardTitle className="text-2xl mb-1">{point.pattern}</CardTitle>
                      <CardDescription className="text-base">{point.meaning}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBookmark(point.id)}
                    >
                      <Star 
                        className={`w-5 h-5 ${bookmarked[point.id] ? 'fill-primary text-primary' : ''}`} 
                      />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {point.explanation}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Examples
                      </h4>
                      <div className="space-y-3">
                        {point.examples.map((example, idx) => (
                          <div key={idx} className="p-3 bg-muted/50 rounded-lg space-y-1">
                            <p className="font-medium">{example.japanese}</p>
                            <p className="text-sm text-muted-foreground">{example.romaji}</p>
                            <p className="text-sm">{example.english}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full gap-2">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGrammar.length === 0 && (
            <Card className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No grammar patterns found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
