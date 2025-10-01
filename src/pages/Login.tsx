import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Zap } from "lucide-react"; // Added Zap icon for flair

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    // Note: Assuming these API endpoints are correct for your backend setup
    const url = isSignUp ? `/api/auth/register` : `/api/auth/login`;
    const body = isSignUp ? { name: 'Admin', email, password, mobile_number: '0000000000' } : { email, password };

    try {
      const response = await fetch(`http://localhost:5001${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'An error occurred');
      }

      if (isSignUp) {
        toast.success("Account created successfully! Please log in.");
        setIsSignUp(false);
        setPassword("");
      } else {
        // Assuming your setAuthToken logic is handled elsewhere or is simple localStorage.setItem
        if (data.token) {
          localStorage.setItem('token', data.token);
          toast.success("Logged in successfully!");
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HIGH-CONTRAST MINIMALIST STYLING ---
  return (
    <div className="min-h-screen flex items-center justify-center p-6" 
         style={{ 
            backgroundColor: '#1E293B', // Slate 800 - Deep, professional dark color
            backgroundImage: 'radial-gradient(at 0% 0%, #374151 0%, transparent 50%), radial-gradient(at 100% 100%, #111827 0%, transparent 50%)' 
         }}
    >
      <Card className="w-full max-w-sm border border-slate-700 bg-slate-900 text-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <Zap className="h-8 w-8 text-cyan-400 mr-2" />
            <CardTitle className="text-3xl font-extrabold text-center tracking-wide text-white">
              {isSignUp ? "Register" : "Sign In"}
            </CardTitle>
          </div>
          <CardDescription className="text-center text-slate-400">
            {isSignUp
              ? "One-time setup for the administrator account."
              : "Access the system with your secured credentials."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="• • • • • •"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold tracking-wider transition-all shadow-lg shadow-cyan-500/30" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "C R E A T E" : "L O G I N"}
            </Button>
            
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">
                  OR
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
            >
              {isSignUp
                ? "Back to Login"
                : "Need Account? Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;