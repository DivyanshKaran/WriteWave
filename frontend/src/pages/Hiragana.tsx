import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { contentService } from "@/lib/api-client";

type CharacterItem = { char: string; romaji?: string };

export default function Hiragana() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CharacterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await contentService.getHiragana();
        const list: CharacterItem[] = (res.data || []).map((c: any) => ({ char: c.char || c.character || c, romaji: c.romaji }));
        setItems(list);
      } catch (e: any) {
        setError(e?.message || 'Failed to load hiragana');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-20 sm:pt-24 pb-16 px-3 sm:px-4">
        <div className="container mx-auto max-w-4xl">
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Hiragana</h1>
            <p className="text-sm sm:text-base md:text-xl text-muted-foreground">
              The basic Japanese phonetic alphabet
            </p>
          </div>

          {/* Mobile-optimized character grid */}
          {loading && <div>Loading...</div>}
          {error && <div className="text-destructive">{error}</div>}
          {!loading && !error && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12">
              {items.map((item, idx) => (
                <Link
                  key={`${item.char}-${idx}`}
                  to={`/characters/hiragana/${encodeURIComponent(item.char)}${item.romaji ? `?romaji=${item.romaji}` : ''}`}
                  className="aspect-square border border-border flex flex-col items-center justify-center hover:border-accent transition-colors cursor-pointer p-2 rounded-md"
                >
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{item.char}</span>
                  {item.romaji && (
                    <span className="text-xs sm:text-sm text-muted-foreground">{item.romaji}</span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Mobile-optimized info section */}
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 border border-border rounded-lg">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">About Hiragana</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Hiragana is one of the three writing systems in Japanese. It consists of 46 basic characters 
              representing sounds. It's primarily used for native Japanese words, grammatical elements, 
              and words without kanji.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}
