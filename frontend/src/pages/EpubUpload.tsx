import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, FileText, BookOpen, Download, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ExtractedKanji {
  character: string;
  meaning: string;
  kunyomi: string[];
  onyomi: string[];
  level: string;
  frequency: number;
  context: string[];
  pageNumbers: number[];
  sentences: string[];
}

interface ExtractionResult {
  extraction: {
    title: string;
    author: string;
    totalKanji: number;
    uniqueKanjiCount: number;
    extractionDate: string;
  };
  kanjiPages: ExtractedKanji[];
  savedCount: number;
}

export default function EpubUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [selectedKanji, setSelectedKanji] = useState<ExtractedKanji | null>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.epub')) {
      toast.error('Please select a valid EPUB file');
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('epub', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://localhost:8000/api/v1/epub/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setExtractionResult(result.data);
        toast.success(`Successfully extracted ${result.data.extraction.uniqueKanjiCount} unique kanji characters!`);
      } else {
        throw new Error(result.message || 'Extraction failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleKanjiClick = (kanji: ExtractedKanji) => {
    setSelectedKanji(kanji);
  };

  const handlePracticeKanji = (kanji: ExtractedKanji) => {
    navigate(`/characters/kanji/${encodeURIComponent(kanji.character)}`);
  };

  const downloadKanjiData = () => {
    if (!extractionResult) return;

    const data = {
      extraction: extractionResult.extraction,
      kanji: extractionResult.kanjiPages.map(k => ({
        character: k.character,
        meaning: k.meaning,
        frequency: k.frequency,
        level: k.level,
        context: k.context.slice(0, 3) // Limit context for download
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${extractionResult.extraction.title.replace(/[^a-zA-Z0-9]/g, '_')}_kanji.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-20 sm:pt-24 pb-16 px-3 sm:px-4">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/characters')}
            className="mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Characters
          </Button>

          {/* Header */}
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
              EPUB Kanji Extractor
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-muted-foreground">
              Upload an EPUB file to extract and study kanji characters
            </p>
          </div>

          {/* Upload Section */}
          {!extractionResult && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload EPUB File
                </CardTitle>
                <CardDescription>
                  Select a Japanese EPUB book to extract kanji characters for study
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer"
                    onClick={handleFileSelect}
                  >
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Click to select EPUB file</p>
                    <p className="text-sm text-muted-foreground">
                      Maximum file size: 50MB
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".epub"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing EPUB...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {extractionResult && (
            <div className="space-y-6">
              {/* Extraction Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Extraction Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">{extractionResult.extraction.title}</div>
                      <div className="text-sm text-muted-foreground">Title</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">{extractionResult.extraction.author}</div>
                      <div className="text-sm text-muted-foreground">Author</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">{extractionResult.extraction.uniqueKanjiCount}</div>
                      <div className="text-sm text-muted-foreground">Unique Kanji</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">{extractionResult.extraction.totalKanji}</div>
                      <div className="text-sm text-muted-foreground">Total Occurrences</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={downloadKanjiData} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Data
                    </Button>
                    <Button onClick={() => setExtractionResult(null)} variant="outline" size="sm">
                      Upload Another
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Kanji Grid */}
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Kanji Characters</CardTitle>
                  <CardDescription>
                    Click on a kanji to view details and practice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    {extractionResult.kanjiPages.map((kanji) => (
                      <div
                        key={kanji.character}
                        className="aspect-square border border-border rounded-md flex flex-col items-center justify-center p-2 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group"
                        onClick={() => handleKanjiClick(kanji)}
                      >
                        <div className="text-lg sm:text-xl font-bold group-hover:text-accent transition-colors">
                          {kanji.character}
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          {kanji.frequency}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Kanji Details Modal */}
              {selectedKanji && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Kanji Details: {selectedKanji.character}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePracticeKanji(selectedKanji)}
                      >
                        Practice
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Basic Information</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Meaning:</strong> {selectedKanji.meaning}</div>
                            <div><strong>Level:</strong> <Badge variant="secondary">{selectedKanji.level}</Badge></div>
                            <div><strong>Frequency:</strong> {selectedKanji.frequency} times</div>
                            {selectedKanji.kunyomi.length > 0 && (
                              <div><strong>Kunyomi:</strong> {selectedKanji.kunyomi.join(', ')}</div>
                            )}
                            {selectedKanji.onyomi.length > 0 && (
                              <div><strong>Onyomi:</strong> {selectedKanji.onyomi.join(', ')}</div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Context Examples</h4>
                          <div className="space-y-1 text-sm">
                            {selectedKanji.context.slice(0, 3).map((context, index) => (
                              <div key={index} className="p-2 bg-muted rounded text-xs">
                                {context}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Example Sentences</h4>
                          <div className="space-y-2 text-sm">
                            {selectedKanji.sentences.slice(0, 3).map((sentence, index) => (
                              <div key={index} className="p-2 bg-muted rounded">
                                {sentence}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Page Numbers</h4>
                          <div className="text-sm">
                            Found on pages: {selectedKanji.pageNumbers.slice(0, 10).join(', ')}
                            {selectedKanji.pageNumbers.length > 10 && '...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
