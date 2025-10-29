import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const studyGroups = [
  {
    id: "n5-study-squad",
    name: "N5 Study Squad",
    members: 45,
    level: "Beginner",
    description: "Daily practice sessions for JLPT N5 preparation. We meet every weekday for 30 minutes of focused study.",
    active: true,
    nextMeeting: "Today at 7:00 PM"
  },
  {
    id: "kanji-warriors",
    name: "Kanji Warriors",
    members: 32,
    level: "Intermediate",
    description: "Learning 10 new kanji every week together. Share mnemonics, study tips, and practice together.",
    active: true,
    nextMeeting: "Tomorrow at 6:00 PM"
  },
  {
    id: "conversation-club",
    name: "Conversation Club",
    members: 28,
    level: "All Levels",
    description: "Weekly video calls for Japanese conversation practice. Improve your speaking skills in a supportive environment.",
    active: true,
    nextMeeting: "Saturday at 2:00 PM"
  },
  {
    id: "anime-study",
    name: "Anime & Study",
    members: 67,
    level: "All Levels",
    description: "Learn Japanese through anime and manga. We watch together and discuss vocabulary and grammar.",
    active: true,
    nextMeeting: "Sunday at 8:00 PM"
  },
  {
    id: "n3-prep",
    name: "N3 Preparation Squad",
    members: 23,
    level: "Intermediate",
    description: "Intensive JLPT N3 preparation. Practice tests, grammar reviews, and group study sessions.",
    active: true,
    nextMeeting: "Friday at 5:00 PM"
  },
  {
    id: "morning-learners",
    name: "Morning Learners",
    members: 19,
    level: "All Levels",
    description: "Early morning study group for those who prefer to learn before work. Start your day in Japanese!",
    active: true,
    nextMeeting: "Tomorrow at 7:00 AM"
  },
  {
    id: "reading-circle",
    name: "Reading Circle",
    members: 15,
    level: "Advanced",
    description: "Read Japanese books and articles together. Discuss meanings, share insights, and improve reading skills.",
    active: false,
    nextMeeting: "Next Monday at 7:00 PM"
  },
  {
    id: "grammar-deep-dive",
    name: "Grammar Deep Dive",
    members: 34,
    level: "Intermediate",
    description: "Intensive grammar study sessions. We tackle difficult grammar points together and practice with exercises.",
    active: true,
    nextMeeting: "Wednesday at 6:30 PM"
  }
];

export default function Groups() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="mb-4">Study Groups</h1>
            <p className="text-xl text-muted-foreground">
              Join or create a group to learn together and stay motivated
            </p>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                Most Active
              </Badge>
              <Badge variant="outline">All Levels</Badge>
              <Badge variant="outline">Beginner</Badge>
              <Badge variant="outline">Intermediate</Badge>
            </div>
            <Button>Create Group</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyGroups.map((group) => (
              <Link key={group.id} to={`/groups/${group.id}`}>
                <Card className="h-full hover:border-accent transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{group.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{group.level}</Badge>
                          {group.active && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{group.members}</span>
                      </div>
                    </div>
                    <CardDescription className="min-h-[3rem]">{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{group.nextMeeting}</span>
                    </div>
                    <Button className="w-full" variant="outline">View Group</Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
