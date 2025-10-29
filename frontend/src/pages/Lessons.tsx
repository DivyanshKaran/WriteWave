import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Send, 
  Mail, 
  BookOpen,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Lessons() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to submit the form.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Request submitted!",
        description: "Thank you for your interest. We'll get back to you soon about compiling your personalized lessons.",
      });
      setFormData({ name: "", email: "", message: "" });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
            <h1 className="mb-4">Help Me Compile Lessons</h1>
            <p className="text-xl text-muted-foreground">
              Connect with us to create personalized Japanese learning lessons tailored to your needs
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-primary/10">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Get Personalized Lessons</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Share your learning goals and we'll create custom lessons for you
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Tell Us About Your Learning Goals *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Example: I want to learn basic Japanese for an upcoming trip. I need lessons on greetings, ordering food, and asking for directions. I prefer visual learning with lots of examples."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Include details about your current level, specific topics you want to learn, 
                    preferred learning style, and any deadlines or goals you have in mind.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-full bg-secondary">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Customized Content</h3>
                    <p className="text-sm text-muted-foreground">
                      Our team will review your request and create lessons specifically designed for your learning journey.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-full bg-secondary">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">We'll Keep You Updated</h3>
                    <p className="text-sm text-muted-foreground">
                      You'll receive updates about your lesson compilation via email. We typically respond within 2-3 business days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
