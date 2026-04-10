import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AssignifyLogo from "@/components/AssignifyLogo";
import api from "@/api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      await api.post("/auth/forgot-password", formData);
      setSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
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
          <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-success/10 text-success rounded-lg p-4 text-sm">
              Check your email for a reset link.
            </div>
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
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
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
