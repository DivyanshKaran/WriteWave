import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const levels = ["N5", "N4", "N3", "N2", "N1"];

const sampleKanji = [
  { char: "一", meaning: "One", kunyomi: "ひと-つ", onyomi: "イチ", level: "N5" },
  { char: "日", meaning: "Sun, Day", kunyomi: "ひ, か", onyomi: "ニチ", level: "N5" },
  { char: "本", meaning: "Book, Origin", kunyomi: "もと", onyomi: "ホン", level: "N5" },
  { char: "人", meaning: "Person", kunyomi: "ひと", onyomi: "ジン", level: "N5" },
  { char: "月", meaning: "Moon, Month", kunyomi: "つき", onyomi: "ゲツ", level: "N5" },
  { char: "火", meaning: "Fire", kunyomi: "ひ", onyomi: "カ", level: "N5" },
  { char: "水", meaning: "Water", kunyomi: "みず", onyomi: "スイ", level: "N5" },
  { char: "木", meaning: "Tree, Wood", kunyomi: "き", onyomi: "モク", level: "N5" },
];

export default function Kanji() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState("N5");

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
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 sm:gap-3 md:gap-4">
            {sampleKanji
              .filter(k => k.level === selectedLevel)
              .map((kanji) => (
                <Link
                  key={kanji.char}
                  to={`/characters/kanji/${encodeURIComponent(kanji.char)}`}
                  className="group aspect-square border-2 border-border flex flex-col items-center justify-center hover:border-accent hover:bg-accent/5 transition-all p-2 sm:p-3 md:p-4 rounded-md"
                >
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 group-hover:text-accent transition-colors">
                    {kanji.char}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center leading-tight">{kanji.meaning}</p>
                </Link>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
