import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus, 
  X,
  Tag,
  Type,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const availableTags = [
  "grammar", "particles", "beginner", "jlpt", "calligraphy", "writing", 
  "kanji", "culture", "vocabulary", "n5", "honorifics", "social", 
  "intermediate", "mistakes", "pronunciation", "common", "tips", 
  "business", "etiquette", "professional", "advanced", "n4", "n3", 
  "n2", "n1", "hiragana", "katakana", "romaji", "listening", "speaking"
];

export default function CreateArticle() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag("");
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in the title and content");
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real app, this would save to backend
    console.log("Saving article:", {
      title,
      excerpt,
      content,
      tags: selectedTags
    });
    
    setIsSaving(false);
    navigate('/articles');
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-20 sm:pt-24 px-3 sm:px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/articles')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {isPreview ? "Edit" : "Preview"}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !title.trim() || !content.trim()}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Publish Article"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Write Your Article
                  </CardTitle>
                  <CardDescription>
                    Share your knowledge and insights with the Japanese learning community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Article Title</label>
                    <Input
                      placeholder="Enter a compelling title for your article..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Article Excerpt</label>
                    <Textarea
                      placeholder="Write a brief summary of your article (optional)..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will appear as a preview in article listings
                    </p>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Article Content</label>
                    {isPreview ? (
                      <div className="min-h-[400px] p-4 border rounded-md bg-muted/50">
                        <div 
                          className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground"
                          dangerouslySetInnerHTML={{ 
                            __html: content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                          }}
                        />
                      </div>
                    ) : (
                      <Textarea
                        placeholder="Write your article content here... You can use markdown formatting:

**Bold text**
*Italic text*

# Heading 1
## Heading 2

- Bullet point
- Another point

1. Numbered list
2. Second item

> Quote block

`code snippet`"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[400px] resize-none font-mono text-sm"
                      />
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {isPreview ? "Preview mode - click Edit to continue writing" : "Supports basic markdown formatting"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Tags
                  </CardTitle>
                  <CardDescription>
                    Add tags to help readers find your article
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Selected Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag}
                            <X className="w-3 h-3" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Custom Tag */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Add Custom Tag</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter custom tag..."
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                      />
                      <Button 
                        size="sm" 
                        onClick={handleAddCustomTag}
                        disabled={!customTag.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Available Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Popular Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <Button
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectedTags.includes(tag) ? handleRemoveTag(tag) : handleAddTag(tag)}
                          className="text-xs"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Writing Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Writing Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-medium">Title Tips:</h4>
                      <p className="text-muted-foreground">Make it clear, specific, and engaging</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Content Structure:</h4>
                      <p className="text-muted-foreground">Use headings, bullet points, and examples</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Tags:</h4>
                      <p className="text-muted-foreground">Choose 3-5 relevant tags for better discoverability</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Examples:</h4>
                      <p className="text-muted-foreground">Include practical examples and real-world usage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Article Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Article Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Title Length:</span>
                      <span>{title.length} characters</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Content Length:</span>
                      <span>{content.length} characters</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Read Time:</span>
                      <span>{Math.ceil(content.split(' ').length / 200)} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tags:</span>
                      <span>{selectedTags.length}</span>
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
