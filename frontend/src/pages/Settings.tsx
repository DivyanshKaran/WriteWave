import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Lock,
  Globe,
  Palette,
  Target,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/app')}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-12">
            <h1 className="mb-4">Settings</h1>
            <p className="text-xl text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account
                </CardTitle>
                <CardDescription>Update your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your full name" defaultValue="Sakura Tanaka" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" defaultValue="sakura.tanaka@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="@username" defaultValue="@sakura_learns" />
                </div>
                <Separator />
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily-reminder">Daily Study Reminder</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified to maintain your study streak
                    </p>
                  </div>
                  <Switch id="daily-reminder" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="achievements">Achievement Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you earn badges
                    </p>
                  </div>
                  <Switch id="achievements" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="community">Community Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Replies to your posts and messages
                    </p>
                  </div>
                  <Switch id="community" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newsletter">Email Newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly learning tips and resources
                    </p>
                  </div>
                  <Switch id="newsletter" />
                </div>
              </CardContent>
            </Card>

            {/* Learning Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Learning Preferences
                </CardTitle>
                <CardDescription>Customize your learning experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="daily-goal">Daily Study Goal</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="daily-goal">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Default Difficulty</Label>
                  <Select defaultValue="intermediate">
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="audio-playback">Auto-play Audio</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically play pronunciation audio
                    </p>
                  </div>
                  <Switch id="audio-playback" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="stroke-order">Show Stroke Order</Label>
                    <p className="text-sm text-muted-foreground">
                      Display stroke order when practicing
                    </p>
                  </div>
                  <Switch id="stroke-order" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="font-size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Language & Region */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Language & Region
                </CardTitle>
                <CardDescription>Set your language preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="interface-lang">Interface Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="interface-lang">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="romanization">Romanization Style</Label>
                  <Select defaultValue="hepburn">
                    <SelectTrigger id="romanization">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hepburn">Hepburn</SelectItem>
                      <SelectItem value="kunrei">Kunrei-shiki</SelectItem>
                      <SelectItem value="nihon">Nihon-shiki</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>Manage your privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profile-public">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to see your profile
                    </p>
                  </div>
                  <Switch id="profile-public" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-progress">Show Progress</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your learning statistics publicly
                    </p>
                  </div>
                  <Switch id="show-progress" defaultChecked />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button variant="outline" className="w-full">Change Password</Button>
                  <Button variant="outline" className="w-full">Export My Data</Button>
                  <Button variant="destructive" className="w-full">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
