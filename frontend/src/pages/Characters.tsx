import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const characterTypes = [
  { 
    title: "Hiragana", 
    path: "/characters/hiragana",
    char: "あ",
    description: "46 basic characters for native Japanese words"
  },
  { 
    title: "Katakana", 
    path: "/characters/katakana",
    char: "ア",
    description: "46 characters for foreign words and names"
  },
  { 
    title: "Kanji", 
    path: "/characters/kanji",
    char: "漢",
    description: "2000+ characters adapted from Chinese"
  },
  { 
    title: "Radicals", 
    path: "/characters/radicals",
    char: "亻",
    description: "Building blocks of kanji characters"
  },
];

export default function Characters() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-20 sm:pt-24 pb-16 px-3 sm:px-4">
        <div className="container mx-auto">
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Characters</h1>
            <p className="text-sm sm:text-base md:text-xl text-muted-foreground">
              Choose a writing system to study
            </p>
          </div>

          {/* Mobile-optimized character grid - single column on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-6xl">
            {characterTypes.map((type) => (
              <Link
                key={type.path}
                to={type.path}
                className="group border border-border p-4 sm:p-6 md:p-8 hover:border-accent transition-all rounded-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 group-hover:text-accent transition-colors">
                    {type.char}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2">{type.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{type.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
