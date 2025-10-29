import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface Activity {
  action: string;
  detail: string;
  time: string;
}

interface ProfileActivityProps {
  activities: Activity[];
}

export function ProfileActivity({ activities }: ProfileActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.detail}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
