import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { WritingCanvas } from "@/components/WritingCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, Layers, Pen, Lightbulb, Edit3, Save, X, Volume2 } from "lucide-react";

import { contentService } from "@/lib/api-client";

export default function KanjiPractice() {
  const { char } = useParams<{ char: string }>();
  const navigate = useNavigate();
  const [userStory, setUserStory] = useState("");
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [savedStory, setSavedStory] = useState("");
  const [showStrokeNumbers, setShowStrokeNumbers] = useState(true);
  const [isLearned, setIsLearned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kanji, setKanji] = useState<any>({ meaning: '', kunyomi: '', onyomi: '', strokeOrder: [], vocabulary: [] });

  const decodedChar = char ? decodeURIComponent(char) : '';

  useEffect(() => {
    const load = async () => {
      if (!decodedChar) return;
      setLoading(true);
      setError(null);
      try {
        const res = await contentService.getCharacter(decodedChar);
        const details = res.data || {};
        // Optionally fetch stroke order/pronunciation/examples if available
        setKanji({
          meaning: details.meaning || details.translation || '',
          kunyomi: details.kunyomi || '',
          onyomi: details.onyomi || '',
          strokeOrder: details.strokeOrder || [],
          vocabulary: details.vocabulary || [],
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load kanji');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [decodedChar]);

  const handleSaveStory = () => {
    setSavedStory(userStory);
    setIsEditingStory(false);
    // TODO: Save to backend
    console.log("Saving story:", userStory);
  };

  const handleEditStory = () => {
    setUserStory(savedStory);
    setIsEditingStory(true);
  };

  const handleCancelEdit = () => {
    setUserStory(savedStory);
    setIsEditingStory(false);
  };

  const handleMarkLearned = () => {
    setIsLearned(!isLearned);
    // TODO: Save to backend
    console.log("Marked as learned:", !isLearned);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header isAuthenticated />
        <main className="flex-1 pt-20 sm:pt-24 pb-16 px-3 sm:px-4">
          <div className="container mx-auto max-w-7xl">Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header isAuthenticated />
        <main className="flex-1 pt-20 sm:pt-24 pb-16 px-3 sm:px-4">
          <div className="container mx-auto max-w-7xl text-destructive">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-20 sm:pt-24 pb-16 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/characters/kanji')}
            className="mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Kanji
          </Button>

          {/* Mobile-first responsive grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            
            {/* LEFT COLUMN - Practice Area */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* Character Display */}
              <Card className="border-2 border-accent">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="text-center">
                    <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold mb-2 sm:mb-4">{decodedChar}</h1>
                    <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-4 sm:mb-6">{kanji.meaning}</p>
                    
                    {/* Readings */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="text-center p-2 sm:p-3 lg:p-4 border border-border rounded-lg">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Kun'yomi</p>
                        <p className="text-sm sm:text-base lg:text-lg font-medium">{kanji.kunyomi}</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 lg:p-4 border border-border rounded-lg">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">On'yomi</p>
                        <p className="text-sm sm:text-base lg:text-lg font-medium">{kanji.onyomi}</p>
                      </div>
                    </div>

                    {/* Pronunciation Buttons */}
                    <div className="flex gap-2 sm:gap-3 lg:gap-4 justify-center">
                      <Button size="sm" variant="outline" onClick={() => speakText(kanji.kunyomi)}>
                        <Volume2 className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Kun'yomi</span>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => speakText(kanji.onyomi)}>
                        <Volume2 className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">On'yomi</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Writing Canvas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pen className="w-5 h-5" />
                    Writing Practice
                  </CardTitle>
                  <CardDescription>
                    Trace the character shown in the background to practice writing. 
                    After you're done, click "Submit & Check" to analyze your drawing using AI.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WritingCanvas 
                    referenceChar={decodedChar} 
                    width={Math.min(window.innerWidth * 0.8, 400)} 
                    height={Math.min(window.innerWidth * 0.8, 400)} 
                    showDetector={true}
                  />
                </CardContent>
              </Card>

              {/* Mark as Learned */}
              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-green-800">
                      {isLearned ? "✓ Kanji Learned!" : "Mark This Kanji as Learned"}
                    </h3>
                    <p className="text-sm sm:text-base text-green-700 mb-4">
                      {isLearned 
                        ? "Great job! You've mastered this kanji." 
                        : "Click the button below when you feel confident with this kanji."
                      }
                    </p>
                    <Button 
                      size="lg" 
                      onClick={handleMarkLearned}
                      className={`w-full sm:w-auto ${
                        isLearned 
                          ? "bg-green-600 hover:bg-green-700 text-white" 
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {isLearned ? "✓ Marked as Learned" : "Mark as Learned"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stroke Order Practice */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Stroke Order Practice
                  </CardTitle>
                  <CardDescription>
                    Learn the correct stroke order for this character
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="showNumbers"
                      checked={showStrokeNumbers}
                      onChange={(e) => setShowStrokeNumbers(e.target.checked)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                    />
                    <label htmlFor="showNumbers" className="text-sm">Show stroke numbers</label>
                  </div>
                  {/* Traditional Stroke Order */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {kanji.strokeOrder.map((stroke: any, index: number) => (
                      <div key={index} className="p-2 sm:p-3 border border-border rounded text-center">
                        <div className="text-sm font-bold mb-1">{stroke.number}</div>
                        <div className="text-xs text-muted-foreground">{stroke.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* My Story / Mnemonic */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    My Story / Mnemonic
                  </CardTitle>
                  <CardDescription>
                    Create your own memory aid for this kanji
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  {!savedStory && !isEditingStory ? (
                    <div>
                      <Textarea
                        placeholder="Write your own story, mnemonic, or memory aid for this kanji..."
                        value={userStory}
                        onChange={(e) => setUserStory(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <Button 
                          size="sm" 
                          onClick={handleSaveStory}
                          disabled={!userStory.trim()}
                        >
                          Save Story
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {isEditingStory ? (
                        <div>
                          <Textarea
                            value={userStory}
                            onChange={(e) => setUserStory(e.target.value)}
                            className="min-h-[100px] resize-none"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveStory}>
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="min-h-[100px] p-3 border border-border rounded-md bg-muted/50">
                            <p className="text-sm whitespace-pre-wrap">{savedStory}</p>
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button size="sm" variant="outline" onClick={handleEditStory}>
                              <Edit3 className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN - Information */}
            <div className="space-y-4 sm:space-y-6">

              {/* Vocabulary Examples */}
              <Card className="border-2 border-accent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <BookOpen className="w-5 h-5" />
                    Vocabulary Examples
                  </CardTitle>
                  <CardDescription>
                    Common words using this kanji
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-accent/5">
                  <div className="space-y-3 sm:space-y-4">
                    {kanji.vocabulary.map((vocab: any, index: number) => (
                      <div 
                        key={index} 
                        className="p-3 sm:p-4 border border-border rounded-lg hover:border-accent transition-colors bg-background"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h4 className="text-lg sm:text-xl lg:text-2xl font-bold">{vocab.word}</h4>
                          <Badge variant="secondary" className="w-fit">{vocab.reading}</Badge>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground">{vocab.meaning}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Kanji Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Kanji Details
                  </CardTitle>
                  <CardDescription>
                    Additional information about this character
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-2 sm:p-3 border border-border rounded-lg">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Stroke Count</p>
                      <p className="text-lg sm:text-xl font-bold">{kanji.strokeOrder.length}</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 border border-border rounded-lg">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Frequency</p>
                      <p className="text-lg sm:text-xl font-bold">Common</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 border border-border rounded-lg">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Grade Level</p>
                      <p className="text-lg sm:text-xl font-bold">1st Grade</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 border border-border rounded-lg">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Unicode</p>
                      <p className="text-sm sm:text-base font-bold">{decodedChar.charCodeAt(0).toString(16).toUpperCase()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Radical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Radical Information
                  </CardTitle>
                  <CardDescription>
                    Building blocks of this kanji
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 border border-border rounded-lg">
                      <p className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Primary Radical</p>
                      <p className="text-sm sm:text-base text-muted-foreground">一 (one) - horizontal line</p>
                    </div>
                    <div className="p-3 sm:p-4 border border-border rounded-lg">
                      <p className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Radical Meaning</p>
                      <p className="text-sm sm:text-base text-muted-foreground">Represents the concept of unity or singularity</p>
                    </div>
                    <div className="p-3 sm:p-4 border border-border rounded-lg">
                      <p className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Radical Strokes</p>
                      <p className="text-sm sm:text-base text-muted-foreground">1 stroke</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Context */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Usage Context
                  </CardTitle>
                  <CardDescription>
                    How this kanji is commonly used
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 border border-border rounded-lg">
                      <p className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Numbers & Counting</p>
                      <p className="text-sm sm:text-base text-muted-foreground">Used in counting and numerical expressions</p>
                    </div>
                    <div className="p-3 sm:p-4 border border-border rounded-lg">
                      <p className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Basic Concepts</p>
                      <p className="text-sm sm:text-base text-muted-foreground">Fundamental concept in Japanese language</p>
                    </div>
                    <div className="p-3 sm:p-4 border border-border rounded-lg">
                      <p className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Compound Words</p>
                      <p className="text-sm sm:text-base text-muted-foreground">Often appears as the first character in compounds</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}