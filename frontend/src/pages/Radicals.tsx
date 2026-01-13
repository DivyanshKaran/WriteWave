import { useMemo, useState } from "react";
import { useRadicals } from "@/hooks/useContent";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Layers } from "lucide-react";

const radicals: any[] = [];

export default function Radicals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStrokes, setSelectedStrokes] = useState<number | null>(null);

  const params = useMemo(() => ({
    q: searchQuery || undefined,
    strokes: selectedStrokes || undefined,
  }), [searchQuery, selectedStrokes]);
  const { data, isLoading, error } = useRadicals(params as any);
  const filteredRadicals = (data || []).filter((r: any) => r);
  const strokeCounts = useMemo(() => [] as number[], []);

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
          {isLoading && <Card className="p-6">Loading...</Card>}
          {error && <div className="text-destructive">{(error as any)?.message || 'Failed to load radicals'}</div>}
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
