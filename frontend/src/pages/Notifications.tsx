import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Flame, 
  MessageCircle, 
  Users,
  Target,
  BookOpen,
  CheckCircle,
  Bell
} from "lucide-react";

// Sample notifications
const notifications = [
  {
    id: 1,
    type: "achievement",
    icon: Trophy,
    title: "Achievement Unlocked!",
    message: "You've completed 100 characters. Keep it up!",
    time: "2 hours ago",
    read: false
  },
  {
    id: 2,
    type: "streak",
    icon: Flame,
    title: "12-Day Streak!",
    message: "You're on fire! Don't forget to study today.",
    time: "5 hours ago",
    read: false
  },
  {
    id: 3,
    type: "community",
    icon: MessageCircle,
    title: "New Reply",
    message: "Someone replied to your post 'Best way to memorize Kanji?'",
    time: "1 day ago",
    read: true
  },
  {
    id: 4,
    type: "group",
    icon: Users,
    title: "Study Group Invite",
    message: "You've been invited to join 'N5 Study Squad'",
    time: "1 day ago",
    read: true
  },
  {
    id: 5,
    type: "goal",
    icon: Target,
    title: "Weekly Goal Complete",
    message: "Congratulations! You've reached your weekly study goal of 5 hours.",
    time: "2 days ago",
    read: true
  },
  {
    id: 6,
    type: "lesson",
    icon: BookOpen,
    title: "New Lesson Available",
    message: "The next lesson in 'Hiragana Mastery' is now unlocked!",
    time: "3 days ago",
    read: true
  },
  {
    id: 7,
    type: "achievement",
    icon: CheckCircle,
    title: "Lesson Completed",
    message: "Great job finishing 'Basic Greetings' with a perfect score!",
    time: "4 days ago",
    read: true
  },
];

export default function Notifications() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2">Notifications</h1>
                <p className="text-lg text-muted-foreground">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "You're all caught up!"}
                </p>
              </div>
              <Button variant="outline" size="sm">
                Mark all as read
              </Button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No notifications yet</h3>
                <p className="text-muted-foreground">
                  We'll notify you when something important happens
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <Card 
                    key={notification.id}
                    className={`transition-colors cursor-pointer ${
                      !notification.read ? 'border-accent bg-accent/5' : 'hover:border-accent'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full shrink-0 ${
                          !notification.read ? 'bg-primary/10' : 'bg-secondary'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            !notification.read ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold">{notification.title}</h3>
                            {!notification.read && (
                              <Badge variant="default" className="shrink-0 h-5 w-5 p-0 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
