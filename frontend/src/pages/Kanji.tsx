import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useKanjiList } from "@/hooks/useContent";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";

const levels = ["N5", "N4", "N3", "N2", "N1"];

type KanjiItem = { char: string; meaning?: string; level?: string };

export default function Kanji() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const { data, isLoading, error } = useKanjiList(selectedLevel);
  const kanji: KanjiItem[] = (data || []).map((k: any) => ({ char: k.char || k.character || k, meaning: k.meaning, level: k.level }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-20 sm:pt-24 pb-16 px-3 sm:px-4">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/characters')}
            className="mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Characters
          </Button>

          {/* Mobile-first header */}
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Kanji</h1>
            <p className="text-sm sm:text-base md:text-xl text-muted-foreground">
              Study characters by JLPT level
            </p>
          </div>

          {/* Mobile-optimized level selector */}
          <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 flex-wrap">
            {levels.map((level) => (
              <Badge
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                className="cursor-pointer px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-sm sm:text-base hover:border-accent transition-colors"
                onClick={() => setSelectedLevel(level)}
              >
                {level}
              </Badge>
            ))}
          </div>

          {/* Mobile-optimized kanji grid */}
          {isLoading && <Card className="p-6">Loading...</Card>}
          {error && (
            <ErrorBanner
              message={(error as any)?.message || 'Failed to load kanji'}
              onRetry={() => window.location.reload()}
            />
          )}
          {!isLoading && !error && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 sm:gap-3 md:gap-4">
              {kanji.map((k) => (
                <Link
                  key={k.char}
                  to={`/characters/kanji/${encodeURIComponent(k.char)}`}
                  className="group aspect-square border-2 border-border flex flex-col items-center justify-center hover:border-accent hover:bg-accent/5 transition-all p-2 sm:p-3 md:p-4 rounded-md"
                >
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 group-hover:text-accent transition-colors">
                    {k.char}
                  </div>
                  {k.meaning && (
                    <p className="text-xs sm:text-sm text-muted-foreground text-center leading-tight">{k.meaning}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
          {!isLoading && !error && kanji.length === 0 && (
            <EmptyState title="No kanji found" description="Try another JLPT level or check back later." />
          )}
        </div>
      </main>
    </div>
  );
}
