import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { WritingCanvas } from "@/components/WritingCanvas";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CharacterPractice() {
  const { type, char } = useParams<{ type: string; char: string }>();
  const navigate = useNavigate();

  // Decode the character from URL
  const decodedChar = char ? decodeURIComponent(char) : '';
  
  // Get romaji from URL search params
  const searchParams = new URLSearchParams(window.location.search);
  const romaji = searchParams.get('romaji') || '';

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate(`/characters/${type}`)}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {type?.charAt(0).toUpperCase() + type?.slice(1)}
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Writing Practice</h2>
              <p className="text-muted-foreground">
                Trace the character shown in the background to practice writing. 
                After you're done, click "Submit & Check" to analyze your drawing using AI.
              </p>
              <WritingCanvas referenceChar={decodedChar} width={400} height={400} showDetector={true} />
            </div>

            <div className="space-y-6">
              <div className="border border-border p-8">
                <h1 className="text-8xl font-bold text-center mb-4">{decodedChar}</h1>
                <p className="text-2xl text-center text-muted-foreground">{romaji}</p>
              </div>

              <div className="border border-border p-6">
                <h3 className="text-xl font-bold mb-4">Character Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Character:</span>
                    <span className="font-medium">{decodedChar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Romaji:</span>
                    <span className="font-medium">{romaji}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{type?.charAt(0).toUpperCase() + type?.slice(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
