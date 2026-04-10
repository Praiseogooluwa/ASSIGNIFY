import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Mail, Phone, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/api/axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import AssignifyLogo from "@/components/AssignifyLogo";

const Login = () => {
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
      const { data } = await api.post("/auth/login", formData);
      localStorage.setItem("ap_token", data.token);
      // Store display name for use in dashboard greeting
      if (data.user?.display_name) {
        localStorage.setItem("ap_display_name", data.user.display_name);
      }
      navigate("/dashboard");
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — Brand panel */}
      <div className="relative hidden lg:flex lg:w-[45%] bg-primary items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary-foreground/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        </div>
        <motion.div
          className="relative z-10 max-w-sm px-8 space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="space-y-2">
            <AssignifyLogo size="lg" variant="light" showText={false} />
            <h1 className="font-display text-4xl font-bold text-primary-foreground leading-tight pt-4">
              Your assignments,<br />
              <span className="text-accent">simplified.</span>
            </h1>
            <p className="text-primary-foreground/60 text-base leading-relaxed pt-2">
              Create, collect, and grade — all from one beautiful dashboard. Built for modern lecturers.
            </p>
          </div>
          <div className="space-y-3 pt-4">
            {["Create & share in seconds", "Auto-track late work", "Export scores instantly"].map((text, i) => (
              <motion.div key={text} className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12 }}>
                <div className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span className="text-primary-foreground/70 text-sm">{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex flex-col p-6 sm:p-10 bg-background min-h-screen lg:min-h-0">
        <motion.div
          className="w-full max-w-sm mx-auto space-y-8 flex-1 flex flex-col justify-center"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="lg:hidden mb-2">
            <AssignifyLogo size="sm" variant="dark" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Lecturer Portal</p>
            <h2 className="font-display text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {/* Inline error banner — shows instead of silent page refresh */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
                className={`h-11 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                  className={`h-11 pr-10 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 font-semibold gap-2" disabled={loading}>
              {loading ? <LoadingSpinner className="p-0 [&_svg]:h-5 [&_svg]:w-5" /> : (<>Sign In <ArrowRight className="h-4 w-4" /></>)}
            </Button>
          </form>

          <div className="flex items-center justify-between text-sm">
            <Link to="/register" className="text-primary font-medium hover:underline">Create Account</Link>
            <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground transition-colors">Forgot Password?</Link>
          </div>
        </motion.div>

        <div className="w-full max-w-sm mx-auto border-t border-border pt-4 mt-4 space-y-1.5">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {/* mailto: links — these properly open the email app */}
            <a
              href="mailto:praiseogooluwa118@gmail.com?subject=Assignify Support"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Mail className="h-3 w-3" />
              <span>praiseogooluwa118@gmail.com</span>
            </a>
            <a href="tel:+2347048116542" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Phone className="h-3 w-3" />
              <span>+234 704 811 6542</span>
            </a>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Built by <span className="font-semibold text-foreground">Isaiah Ogooluwa Bakare</span> · Assignify © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;