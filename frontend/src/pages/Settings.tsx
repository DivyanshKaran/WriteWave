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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService, notificationService } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export default function Settings() {
  const navigate = useNavigate();
  const userId = useAuthStore.getState().user?.id;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const [dailyReminder, setDailyReminder] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [community, setCommunity] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  const [dailyGoal, setDailyGoal] = useState("30");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [audioPlayback, setAudioPlayback] = useState(true);
  const [strokeOrder, setStrokeOrder] = useState(true);

  const [theme, setTheme] = useState("system");
  const [fontSize, setFontSize] = useState("medium");

  const [interfaceLang, setInterfaceLang] = useState("en");
  const [romanization, setRomanization] = useState("hepburn");

  const [profilePublic, setProfilePublic] = useState(true);
  const [showProgress, setShowProgress] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      setSaved(null);
      try {
        const [profileRes, settingsRes] = await Promise.all([
          userService.getProfile(),
          userService.getSettings(),
        ]);
        const p = profileRes.data || {};
        setName(p.name || "");
        setEmail(p.email || "");
        setUsername(p.username || "");

        const s = settingsRes.data || {};
        setDailyGoal(String(s.learning?.dailyGoal ?? "30"));
        setDifficulty(s.learning?.difficulty ?? "intermediate");
        setAudioPlayback(s.learning?.audioPlayback ?? true);
        setStrokeOrder(s.learning?.strokeOrder ?? true);
        setTheme(s.preferences?.theme ?? "system");
        setFontSize(s.preferences?.fontSize ?? "medium");
        setInterfaceLang(s.preferences?.language ?? "en");
        setRomanization(s.preferences?.romanization ?? "hepburn");
        setProfilePublic(s.privacy?.profilePublic ?? true);
        setShowProgress(s.privacy?.showProgress ?? true);

        if (userId) {
          try {
            const pref = await notificationService.getPreferences(userId);
            const n = pref.data || {};
            setDailyReminder(!!n.dailyReminder);
            setAchievements(!!n.achievements);
            setCommunity(!!n.community);
            setNewsletter(!!n.newsletter);
          } catch {}
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load settings');
      }
    };
    load();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(null);
    try {
      await userService.updateProfile({ name, email, username } as any);
      await userService.updateSettings({
        learning: { dailyGoal: Number(dailyGoal), difficulty, audioPlayback, strokeOrder },
        preferences: { theme, fontSize, language: interfaceLang, romanization },
        privacy: { profilePublic, showProgress },
      } as any);
      if (userId) {
        await notificationService.updatePreferences(userId, {
          dailyReminder,
          achievements,
          community,
          newsletter,
        } as any);
      }
      setSaved('Saved successfully');
    } catch (e: any) {
      setError(e?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

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
                  <Input id="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <Separator />
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
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
                  <Switch id="daily-reminder" checked={dailyReminder} onCheckedChange={setDailyReminder} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="achievements">Achievement Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you earn badges
                    </p>
                  </div>
                  <Switch id="achievements" checked={achievements} onCheckedChange={setAchievements} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="community">Community Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Replies to your posts and messages
                    </p>
                  </div>
                  <Switch id="community" checked={community} onCheckedChange={setCommunity} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newsletter">Email Newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly learning tips and resources
                    </p>
                  </div>
                  <Switch id="newsletter" checked={newsletter} onCheckedChange={setNewsletter} />
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
                  <Select value={dailyGoal} onValueChange={setDailyGoal}>
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
                  <Select value={difficulty} onValueChange={setDifficulty}>
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
                  <Switch id="audio-playback" checked={audioPlayback} onCheckedChange={setAudioPlayback} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="stroke-order">Show Stroke Order</Label>
                    <p className="text-sm text-muted-foreground">
                      Display stroke order when practicing
                    </p>
                  </div>
                  <Switch id="stroke-order" checked={strokeOrder} onCheckedChange={setStrokeOrder} />
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
                  <Select value={theme} onValueChange={setTheme}>
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
                  <Select value={fontSize} onValueChange={setFontSize}>
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
                  <Select value={interfaceLang} onValueChange={setInterfaceLang}>
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
                  <Select value={romanization} onValueChange={setRomanization}>
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
                  <Switch id="profile-public" checked={profilePublic} onCheckedChange={setProfilePublic} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-progress">Show Progress</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your learning statistics publicly
                    </p>
                  </div>
                  <Switch id="show-progress" checked={showProgress} onCheckedChange={setShowProgress} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button variant="outline" className="w-full">Change Password</Button>
                  <Button variant="outline" className="w-full">Export My Data</Button>
                  <Button variant="destructive" className="w-full">Delete Account</Button>
                </div>
              </CardContent>
            </Card>

            {(error || saved) && (
              <div>
                {error && <p className="text-destructive">{error}</p>}
                {saved && <p className="text-green-600">{saved}</p>}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
