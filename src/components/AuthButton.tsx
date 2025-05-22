import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { AuthError } from "@supabase/supabase-js";

const AuthButton = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");

  // Use the useAuth hook to get user, signOut, signInWithPassword, and signUp functions
  const { user, signOut, signInWithPassword, signUp } = useAuth();

  // Sign in form state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Sign up form state
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!signInEmail || !signInPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSigningIn(true);

      // Sign in with Supabase using the function from context
      const { data, error } = await signInWithPassword(signInEmail, signInPassword);

      if (error) throw error;

      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });

      // Close dialog and reset form
      setIsOpen(false);
      setSignInEmail("");
      setSignInPassword("");

    } catch (error: unknown) { // Use unknown type
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error instanceof AuthError ? error.message : "An unexpected error occurred during sign in.", // Safely access message
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!signUpEmail || !signUpPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure your passwords match",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSigningUp(true);

      // Sign up with Supabase using the function from context
      const { data, error } = await signUp(signUpEmail, signUpPassword);

      if (error) throw error;

      toast({
        title: "Account created successfully",
        description: "Please check your email for verification instructions.",
      });

      // Close dialog and reset form
      setIsOpen(false);
      setSignUpEmail("");
      setSignUpPassword("");
      setSignUpConfirmPassword("");

    } catch (error: unknown) { // Use unknown type
      console.error("Sign up error:", error);
      toast({
        title: "Sign up failed",
        description: error instanceof AuthError ? error.message : "An unexpected error occurred during sign up.", // Safely access message
        variant: "destructive",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  if (user) {
    return (
      <Button
        variant="ghost"
        onClick={signOut}
        className="text-white hover:text-gray-300"
      >
        Sign Out
      </Button>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="bg-gradient-to-r from-alpaca-purple to-accent hover:opacity-90 transition-opacity text-white"
          >
            Sign In
          </Button>
        </DialogTrigger>

        <DialogContent className="glass-card bg-alpaca-dark/90 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="signin" value={authTab} onValueChange={(value) => setAuthTab(value as "signin" | "signup")}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-white/5 border-white/10 focus:border-alpaca-purple"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 focus:border-alpaca-purple"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full bg-gradient-to-r from-alpaca-purple to-accent hover:opacity-90"
                >
                  {isSigningIn ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-white/5 border-white/10 focus:border-alpaca-purple"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 focus:border-alpaca-purple"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 focus:border-alpaca-purple"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full bg-gradient-to-r from-alpaca-purple to-accent hover:opacity-90"
                >
                  {isSigningUp ? "Signing up..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Button
        variant="ghost"
        onClick={() => {
          setAuthTab("signup");
          setIsOpen(true);
        }}
        className="text-alpaca-purple hover:text-alpaca-purple/80"
      >
        Sign Up
      </Button>
    </>
  );
};

export default AuthButton;