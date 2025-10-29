import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Flame, BookOpen, Trophy, Award, Calendar, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  ProfileHeader, 
  ProfileStats, 
  ProfileBadges, 
  ProfileArticles, 
  ProfileActivity 
} from "@/components/profile";
import { SkipLink } from "@/components/accessibility";

// Sample profile data
const profileData = {
  name: "Sakura Tanaka",
  username: "@sakura_learns",
  email: "sakura.tanaka@example.com",
  location: "Tokyo, Japan",
  joinedDate: "January 2024",
  bio: "Passionate about learning Japanese! Currently preparing for JLPT N4. 日本語を勉強しています！",
  stats: {
    totalCharacters: 184,
    totalVocabulary: 342,
    studyStreak: 12,
    totalHours: 43,
    lessonsCompleted: 28,
    articlesWritten: 5,
    totalViews: 1250,
    totalLikes: 89
  },
  badges: [
    { id: 1, name: "First Steps", description: "Completed first lesson", icon: Target, earned: true },
    { id: 2, name: "Week Warrior", description: "7-day study streak", icon: Flame, earned: true },
    { id: 3, name: "Hiragana Master", description: "Learned all hiragana", icon: BookOpen, earned: true },
    { id: 4, name: "Katakana Master", description: "Learned all katakana", icon: BookOpen, earned: true },
    { id: 5, name: "Century Club", description: "100+ characters learned", icon: Trophy, earned: true },
    { id: 6, name: "Kanji Novice", description: "50+ kanji learned", icon: Award, earned: true },
    { id: 7, name: "Month Milestone", description: "30-day study streak", icon: Calendar, earned: false },
    { id: 8, name: "Vocabulary Vault", description: "500+ words learned", icon: Star, earned: false },
  ],
  recentActivity: [
    { action: "Completed lesson", detail: "Hiragana: N-row", time: "2 hours ago" },
    { action: "Practiced writing", detail: "Kanji: 日本", time: "5 hours ago" },
    { action: "Earned badge", detail: "Century Club", time: "1 day ago" },
    { action: "Joined study group", detail: "N5 Study Squad", time: "2 days ago" },
  ],
  articles: [
    {
      id: 1,
      title: "My Journey Learning Hiragana",
      excerpt: "Tips and tricks that helped me master all 46 hiragana characters in just two weeks.",
      publishedAt: "2024-01-10",
      views: 450,
      likes: 32,
      comments: 8,
      tags: ["hiragana", "beginner", "tips"]
    },
    {
      id: 2,
      title: "Common Japanese Grammar Mistakes",
      excerpt: "Avoid these frequent pitfalls when learning Japanese grammar patterns.",
      publishedAt: "2024-01-05",
      views: 320,
      likes: 28,
      comments: 5,
      tags: ["grammar", "mistakes", "intermediate"]
    },
    {
      id: 3,
      title: "JLPT N5 Study Plan",
      excerpt: "A comprehensive 3-month study plan for passing the JLPT N5 exam.",
      publishedAt: "2024-01-01",
      views: 680,
      likes: 45,
      comments: 12,
      tags: ["jlpt", "n5", "study-plan"]
    }
  ]
};

export default function Profile() {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    // TODO: Implement edit profile functionality
    console.log("Edit profile clicked");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <Header isAuthenticated />
      
      <main id="main-content" className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/app')}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <ProfileHeader 
                user={profileData} 
                onEditProfile={handleEditProfile}
              />
            </CardContent>
          </Card>

          {/* Profile Stats */}
          <ProfileStats stats={profileData.stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Badges Section */}
            <div className="lg:col-span-2">
              <ProfileBadges badges={profileData.badges} />
            </div>

            {/* My Articles */}
            <div>
              <ProfileArticles articles={profileData.articles} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <ProfileActivity activities={profileData.recentActivity} />
          </div>
        </div>
      </main>
    </div>
  );
}
