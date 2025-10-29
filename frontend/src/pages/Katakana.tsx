import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const katakanaRows = [
  { romaji: ['a', 'i', 'u', 'e', 'o'], chars: ['ア', 'イ', 'ウ', 'エ', 'オ'] },
  { romaji: ['ka', 'ki', 'ku', 'ke', 'ko'], chars: ['カ', 'キ', 'ク', 'ケ', 'コ'] },
  { romaji: ['sa', 'shi', 'su', 'se', 'so'], chars: ['サ', 'シ', 'ス', 'セ', 'ソ'] },
  { romaji: ['ta', 'chi', 'tsu', 'te', 'to'], chars: ['タ', 'チ', 'ツ', 'テ', 'ト'] },
  { romaji: ['na', 'ni', 'nu', 'ne', 'no'], chars: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'] },
  { romaji: ['ha', 'hi', 'fu', 'he', 'ho'], chars: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'] },
  { romaji: ['ma', 'mi', 'mu', 'me', 'mo'], chars: ['マ', 'ミ', 'ム', 'メ', 'モ'] },
  { romaji: ['ya', '', 'yu', '', 'yo'], chars: ['ヤ', '', 'ユ', '', 'ヨ'] },
  { romaji: ['ra', 'ri', 'ru', 're', 'ro'], chars: ['ラ', 'リ', 'ル', 'レ', 'ロ'] },
  { romaji: ['wa', '', '', '', 'wo'], chars: ['ワ', '', '', '', 'ヲ'] },
  { romaji: ['n'], chars: ['ン'] },
];

export default function Katakana() {
  const navigate = useNavigate();

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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Katakana</h1>
            <p className="text-sm sm:text-base md:text-xl text-muted-foreground">
              Used for foreign words and emphasis
            </p>
          </div>

          {/* Mobile-optimized character grid */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-8 sm:mb-12">
            {katakanaRows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-3 lg:gap-4">
                {row.chars.map((char, charIndex) => (
                  char ? (
                    <Link
                      key={charIndex}
                      to={`/characters/katakana/${encodeURIComponent(char)}?romaji=${row.romaji[charIndex]}`}
                      className="aspect-square border border-border flex flex-col items-center justify-center hover:border-accent transition-colors cursor-pointer p-1 sm:p-2 rounded-md"
                    >
                      <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-0.5 sm:mb-1 md:mb-2">{char}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {row.romaji[charIndex]}
                      </span>
                    </Link>
                  ) : (
                    <div key={charIndex} className="invisible" />
                  )
                ))}
              </div>
            ))}
          </div>

          {/* Mobile-optimized info section */}
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 border border-border rounded-lg">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">About Katakana</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Katakana is used primarily for foreign loanwords, onomatopoeia, technical terms, 
              and names of plants and animals. It has the same sounds as hiragana but with 
              different character shapes.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}
