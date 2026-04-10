import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AssignifyLogo from "@/components/AssignifyLogo";
import api from "@/api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("email", email);
      await api.post("/auth/forgot-password", formData);
      setSent(true);
    } catch (err: any) {
      // Backend returns error in "detail" field (FastAPI standard)
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1a14] px-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AssignifyLogo size="md" variant="dark" showText={false} />
          </div>
          <h1 className="font-display text-2xl text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your registered email and we'll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <div className="bg-success/10 text-success rounded-lg p-4 text-sm font-medium">
              If an account exists with this email, a reset link has been sent.
            </div>
            <p className="text-xs text-muted-foreground">
              Didn't receive it? Check your spam folder or{" "}
              <button
                onClick={() => { setSent(false); setError(""); }}
                className="text-primary hover:underline"
              >
                try again
              </button>
            </p>
            <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="lecturer@university.edu"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
                className={`focus-visible:ring-primary ${error ? "border-destructive" : ""}`}
              />
              {/* Inline error — shown when email not found or other errors */}
              {error && (
                <div className="flex items-start gap-1.5 text-xs text-destructive mt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>
                    {error}
                    {error.toLowerCase().includes("no account") && (
                      <> <Link to="/register" className="underline font-semibold">Create an account →</Link></>
                    )}
                  </span>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;