import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to /api/auth/verify-email
      console.log("Verifying code:", code);
      
      toast({
        title: "Email verified",
        description: "Your account is now active!",
      });
      
      setTimeout(() => navigate("/app"), 1000);
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Invalid or expired code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      // TODO: Implement API call to /api/auth/resend-verification
      toast({
        title: "Code sent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error) {
      toast({
        title: "Failed to resend",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="mt-1 text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>

            <Button onClick={handleVerify} className="w-full" disabled={isLoading || code.length !== 6}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center text-sm">
              <button
                onClick={handleResend}
                className="text-accent hover:underline"
              >
                Resend verification code
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
