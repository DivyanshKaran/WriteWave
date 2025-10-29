import { Card, CardContent } from "@/components/ui/card";

interface ProfileStatsProps {
  stats: {
    totalCharacters: number;
    totalVocabulary: number;
    studyStreak: number;
    totalHours: number;
    lessonsCompleted: number;
    articlesWritten: number;
    totalViews: number;
  };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    { label: "Characters", value: stats.totalCharacters, color: "text-primary" },
    { label: "Vocabulary", value: stats.totalVocabulary, color: "text-primary" },
    { label: "Day Streak", value: stats.studyStreak, color: "text-orange-500" },
    { label: "Hours", value: stats.totalHours, color: "text-primary" },
    { label: "Lessons", value: stats.lessonsCompleted, color: "text-primary" },
    { label: "Articles", value: stats.articlesWritten, color: "text-green-500" },
    { label: "Views", value: stats.totalViews, color: "text-blue-500" },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {statItems.map((item, index) => (
            <div key={index} className="text-center p-3 bg-secondary rounded-lg">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
