import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Layers } from "lucide-react";

// Sample radical data
const radicals = [
  { id: 1, radical: "亻", name: "person", strokes: 2, meaning: "person, human", examples: ["人", "他", "何"] },
  { id: 2, radical: "氵", name: "water", strokes: 3, meaning: "water", examples: ["水", "海", "泳"] },
  { id: 3, radical: "艹", name: "grass", strokes: 3, meaning: "grass, plant", examples: ["花", "茶", "英"] },
  { id: 4, radical: "口", name: "mouth", strokes: 3, meaning: "mouth, opening", examples: ["口", "名", "吃"] },
  { id: 5, radical: "木", name: "tree", strokes: 4, meaning: "tree, wood", examples: ["木", "林", "森"] },
  { id: 6, radical: "日", name: "sun", strokes: 4, meaning: "sun, day", examples: ["日", "明", "時"] },
  { id: 7, radical: "月", name: "moon", strokes: 4, meaning: "moon, month", examples: ["月", "期", "朝"] },
  { id: 8, radical: "火", name: "fire", strokes: 4, meaning: "fire", examples: ["火", "灯", "焼"] },
  { id: 9, radical: "土", name: "earth", strokes: 3, meaning: "earth, soil", examples: ["土", "地", "場"] },
  { id: 10, radical: "手", name: "hand", strokes: 4, meaning: "hand", examples: ["手", "打", "持"] },
  { id: 11, radical: "心", name: "heart", strokes: 4, meaning: "heart, mind", examples: ["心", "思", "意"] },
  { id: 12, radical: "女", name: "woman", strokes: 3, meaning: "woman, female", examples: ["女", "好", "姉"] },
  { id: 13, radical: "子", name: "child", strokes: 3, meaning: "child", examples: ["子", "学", "字"] },
  { id: 14, radical: "山", name: "mountain", strokes: 3, meaning: "mountain", examples: ["山", "岩", "岸"] },
  { id: 15, radical: "田", name: "rice field", strokes: 5, meaning: "rice field", examples: ["田", "男", "町"] },
  { id: 16, radical: "目", name: "eye", strokes: 5, meaning: "eye", examples: ["目", "見", "相"] },
  { id: 17, radical: "石", name: "stone", strokes: 5, meaning: "stone, rock", examples: ["石", "砂", "研"] },
  { id: 18, radical: "糸", name: "thread", strokes: 6, meaning: "thread, silk", examples: ["糸", "紙", "終"] },
  { id: 19, radical: "言", name: "speak", strokes: 7, meaning: "say, speech", examples: ["言", "話", "語"] },
  { id: 20, radical: "金", name: "gold", strokes: 8, meaning: "metal, gold", examples: ["金", "銀", "鉄"] },
  { id: 21, radical: "食", name: "eat", strokes: 9, meaning: "food, eat", examples: ["食", "飯", "飲"] },
  { id: 22, radical: "馬", name: "horse", strokes: 10, meaning: "horse", examples: ["馬", "駅", "験"] },
];

export default function Radicals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStrokes, setSelectedStrokes] = useState<number | null>(null);

  const filteredRadicals = radicals.filter(r => {
    const matchesSearch = 
      r.radical.includes(searchQuery) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStrokes = selectedStrokes === null || r.strokes === selectedStrokes;

    return matchesSearch && matchesStrokes;
  });

  const strokeCounts = [...new Set(radicals.map(r => r.strokes))].sort((a, b) => a - b);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="mb-4">Radicals</h1>
            <p className="text-xl text-muted-foreground">
              Learn the building blocks of kanji characters
            </p>
          </div>

          {/* Info Card */}
          <Card className="mb-8 border-accent bg-accent/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">What are Radicals?</h3>
                  <p className="text-sm text-muted-foreground">
                    Radicals are the basic components that make up kanji characters. Understanding radicals helps you 
                    recognize patterns, remember kanji more easily, and look up unfamiliar characters in dictionaries. 
                    Most kanji are composed of two or more radicals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Find Radicals</CardTitle>
              <CardDescription>Search by name, meaning, or filter by stroke count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search radicals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={selectedStrokes === null ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedStrokes(null)}
                  >
                    All Strokes
                  </Badge>
                  {strokeCounts.map(count => (
                    <Badge 
                      key={count}
                      variant={selectedStrokes === count ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedStrokes(count)}
                    >
                      {count} strokes
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">
                  Showing {filteredRadicals.length} radicals
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Radicals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRadicals.map((radical) => (
              <Card key={radical.id} className="group hover:border-accent transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-6xl font-bold mb-2 group-hover:scale-110 transition-transform">
                      {radical.radical}
                    </div>
                    <Badge variant="secondary">{radical.strokes} strokes</Badge>
                  </div>
                  <CardTitle className="text-xl">{radical.name}</CardTitle>
                  <CardDescription className="text-base">{radical.meaning}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Example Kanji:
                      </p>
                      <div className="flex gap-2">
                        {radical.examples.map((example, idx) => (
                          <div 
                            key={idx}
                            className="w-12 h-12 border border-border rounded flex items-center justify-center text-2xl font-bold hover:border-accent transition-colors cursor-pointer"
                          >
                            {example}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRadicals.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No radicals found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
