import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroKanji from "@/assets/hero-kanji.png";
import { BookOpen, Grid3x3, Users, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="mb-6">
                Master Japanese<br />Writing
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Learn Hiragana, Katakana, and Kanji through structured lessons and community-driven practice.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link to="/signup">Start Learning</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroKanji} 
                alt="Japanese Kanji Wave" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-secondary">
        <div className="container mx-auto">
          <h2 className="mb-16 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-sm flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-accent">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Choose Your Path</h3>
              <p className="text-muted-foreground">
                Start with Hiragana and Katakana, then progress to Kanji and vocabulary.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-sm flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Practice Daily</h3>
              <p className="text-muted-foreground">
                Structured lessons with spaced repetition to build lasting knowledge.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-sm flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Track Progress</h3>
              <p className="text-muted-foreground">
                Monitor your streaks, achievements, and join the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="mb-16">Learning Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-border p-6 hover:border-accent transition-colors">
              <Grid3x3 className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Characters</h3>
              <p className="text-sm text-muted-foreground">
                Hiragana, Katakana, Kanji, and Radicals
              </p>
            </div>
            <div className="border border-border p-6 hover:border-accent transition-colors">
              <BookOpen className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Vocabulary</h3>
              <p className="text-sm text-muted-foreground">
                Context-rich word learning
              </p>
            </div>
            <div className="border border-border p-6 hover:border-accent transition-colors">
              <TrendingUp className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Progress</h3>
              <p className="text-sm text-muted-foreground">
                Streaks, analytics, achievements
              </p>
            </div>
            <div className="border border-border p-6 hover:border-accent transition-colors">
              <Users className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Forums, groups, leaderboards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free to Use */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="mb-6 text-primary-foreground">Free to Use</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            WriteWave is completely free. No subscriptions, no hidden costs. Just learning.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/signup">Create Free Account</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
