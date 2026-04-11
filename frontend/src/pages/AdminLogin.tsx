import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adminApi } from "@/api/axios";
import AssignifyLogo from "@/components/AssignifyLogo";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      const { data } = await adminApi.post("/admin/login", formData);
      // Store separately from lecturer token so they never mix
      localStorage.setItem("ap_admin_token", data.token);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1a14] px-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AssignifyLogo size="md" variant="dark" showText={false} />
          </div>
          <div className="flex items-center justify-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Super Admin Portal</span>
          </div>
          <h1 className="font-display text-2xl text-foreground">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground">
            This portal is restricted. Unauthorized access is logged.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@assignify.app"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              required
              className="h-11 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                required
                className="h-11 pr-10 focus-visible:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
            {loading ? "Signing in..." : "Sign In as Admin"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Not an admin?{" "}
          <a href="/login" className="text-primary hover:underline">
            Lecturer login →
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;