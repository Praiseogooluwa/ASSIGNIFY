import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AssignifyLogo from "@/components/AssignifyLogo";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  useEffect(() => {
    // Supabase puts tokens in the URL hash: #access_token=xxx&refresh_token=yyy&type=recovery
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const aToken = params.get("access_token");
      const rToken = params.get("refresh_token");
      const type = params.get("type");
      if (aToken && type === "recovery") {
        setAccessToken(aToken);
        setRefreshToken(rToken || "");
        // Clean URL so token isn't visible
        window.history.replaceState(null, "", "/reset-password");
        return;
      }
    }
    setTokenError(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error("Configuration error. Please contact support.");
      }

      // Step 1: Set the session using the recovery tokens
      const sessionRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      let finalToken = accessToken;

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        finalToken = sessionData.access_token || accessToken;
      }

      // Step 2: Update the password
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${finalToken}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error_description || "Failed to reset password. The link may have expired.");
      }

      setDone(true);
      setTimeout(() => navigate("/login"), 3000);

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please request a new reset link.");
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1a14] px-4">
        <div className="w-full max-w-md bg-card rounded-xl shadow-2xl p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <AssignifyLogo size="md" variant="dark" showText={true} />
          </div>
          <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground mb-2">Invalid Reset Link</h2>
            <p className="text-sm text-muted-foreground">
              This password reset link is invalid or has expired. Reset links are only valid for 1 hour.
            </p>
          </div>
          <Link to="/forgot-password">
            <Button className="w-full">Request a New Reset Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1a14] px-4">
        <div className="w-full max-w-md bg-card rounded-xl shadow-2xl p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <AssignifyLogo size="md" variant="dark" showText={true} />
          </div>
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground mb-2">Password Updated!</h2>
            <p className="text-sm text-muted-foreground">
              Your password has been changed. Redirecting to login...
            </p>
          </div>
          <Link to="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1a14] px-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AssignifyLogo size="md" variant="dark" showText={true} />
          </div>
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-foreground">Set New Password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a strong password for your Assignify account
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                required
                className="focus-visible:ring-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                required
                className={`focus-visible:ring-primary pr-10 ${confirm && password !== confirm ? "border-destructive" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirm && password !== confirm && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-md p-3">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || !password || !confirm}>
            {loading ? "Updating password..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;