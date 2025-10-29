import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Grid3x3, BookOpen, GraduationCap, TrendingUp, Users, Settings, FileText } from "lucide-react";

const sections = [
  { title: "Characters", icon: Grid3x3, path: "/characters", description: "Study Hiragana, Katakana, Kanji" },
  { title: "Vocabulary", icon: BookOpen, path: "/vocabulary", description: "Build your word knowledge" },
  { title: "Grammar", icon: BookOpen, path: "/grammar", description: "Master grammar patterns" },
  { title: "Articles", icon: FileText, path: "/articles", description: "Read and write learning articles" },
  { title: "Lessons", icon: GraduationCap, path: "/lessons", description: "Structured learning paths" },
  { title: "Progress", icon: TrendingUp, path: "/progress", description: "Track your achievements" },
  { title: "Community", icon: Users, path: "/community", description: "Connect with learners" },
  { title: "Settings", icon: Settings, path: "/settings", description: "Manage preferences" },
];

export default function AppHub() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-20 sm:pt-24 pb-16 px-3 sm:px-4">
        <div className="container mx-auto">
          {/* Mobile-first header */}
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Dashboard</h1>
            <p className="text-sm sm:text-base md:text-xl text-muted-foreground">
              Choose where to continue your learning journey
            </p>
          </div>

          {/* Mobile-optimized grid - single column on mobile, logical grouping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.path}
                  to={section.path}
                  className="group border border-border p-4 sm:p-6 md:p-8 hover:border-accent transition-all rounded-lg"
                >
                  <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 group-hover:text-accent transition-colors" />
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">{section.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{section.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
