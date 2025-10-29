import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to /api/auth/forgot-password
      console.log("Password reset requested for:", data.email);
      
      toast({
        title: "Email sent",
        description: "Check your inbox for password reset instructions.",
      });
      
      setEmailSent(true);
    } catch (error) {
      toast({
        title: "Request failed",
        description: "Unable to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Forgot Password</h1>
            <p className="text-muted-foreground">
              {emailSent 
                ? "Reset link sent! Check your email."
                : "Enter your email to receive a reset link"}
            </p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center text-sm">
                <Link to="/login" className="text-accent hover:underline">
                  Back to login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <Button asChild className="w-full">
                <Link to="/login">Return to Login</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
