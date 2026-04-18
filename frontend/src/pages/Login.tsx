import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Mail, AlertCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import AssignifyLogo from "@/components/AssignifyLogo";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);

  // ── Mount Turnstile after DOM is ready ──────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const mountWidget = () => {
      if (!containerRef.current || widgetRef.current || !window.turnstile) return;
      widgetRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => setCaptchaToken(token),
        "expired-callback": () => setCaptchaToken(null),
        "error-callback": () => setCaptchaToken(null),
        theme: "light",
        size: "normal",
      });
    };

    if (window.turnstile) {
      mountWidget();
    } else if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = mountWidget;
      document.head.appendChild(script);
    } else {
      // Script exists but still loading — poll until ready
      interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval!);
          mountWidget();
        }
      }, 150);
      setTimeout(() => interval && clearInterval(interval), 8000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (widgetRef.current && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, []);

  const resetCaptcha = () => {
    if (widgetRef.current && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
      setCaptchaToken(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError("Please complete the security check.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("cf_token", captchaToken);
      const { data } = await api.post("/auth/login", formData);
      localStorage.setItem("ap_token", data.token);
      if (data.user?.display_name) {
        localStorage.setItem("ap_display_name", data.user.display_name);
      }
      navigate("/dashboard");
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left — Brand panel ────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-primary items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-black/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <motion.div
          className="relative z-10 w-full max-w-md px-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-10">
            <AssignifyLogo size="lg" variant="light" showText={true} />
          </div>

          <h1 className="font-display text-[2.6rem] font-normal text-white leading-[1.15] mb-4">
            Your assignments,<br />
            <span className="italic text-white/80">simplified.</span>
          </h1>
          <p className="text-white/55 text-base leading-relaxed mb-10">
            Create, collect, and grade — all from one dashboard. Built for Nigerian university lecturers.
          </p>

          <div className="space-y-5">
            {[
              { label: "Create & share in seconds", sub: "One link, no student accounts needed" },
              { label: "Auto-track late work", sub: "See who submitted and when" },
              { label: "Export scores instantly", sub: "Full CA report in one click" },
            ].map((item, i) => (
              <motion.div key={item.label} className="flex items-start gap-3"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.12 }}>
                <div className="mt-1.5 h-2 w-2 rounded-full bg-white/90 shrink-0" />
                <div>
                  <p className="text-white/90 text-sm font-semibold">{item.label}</p>
                  <p className="text-white/45 text-xs mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-12">
            <Shield className="h-3.5 w-3.5 text-white/30" />
            <span className="text-white/30 text-xs">NDPR-compliant · Supabase enterprise storage</span>
          </div>
        </motion.div>
      </div>

      {/* ── Right — Form ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-background">
        <motion.div
          className="flex-1 flex flex-col justify-center w-full max-w-[420px] mx-auto px-8 py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="lg:hidden mb-8">
            <AssignifyLogo size="sm" variant="dark" />
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3">Lecturer Portal</p>
            <h2 className="font-display text-3xl font-normal text-foreground leading-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-2">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3.5 flex items-start gap-2.5 text-sm mb-6">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
              <Input
                id="email" type="email" placeholder="you@university.edu"
                value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required className={`h-12 text-sm ${error ? "border-destructive" : ""}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input
                  id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required className={`h-12 text-sm pr-11 ${error ? "border-destructive" : ""}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Cloudflare Turnstile widget */}
            <div className="flex flex-col items-center gap-1 py-1">
              <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
            </div>

            <Button type="submit" className="w-full h-12 font-semibold gap-2"
              disabled={loading}>
              {loading
                ? <LoadingSpinner className="p-0 [&_svg]:h-4 [&_svg]:w-4" />
                : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>
              }
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create one free</Link>
          </p>
        </motion.div>

        <div className="pb-6 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <Mail className="h-3 w-3" />
            <a href="mailto:support@assignify.com.ng" className="hover:text-primary transition-colors">support@assignify.com.ng</a>
          </div>
          <p className="text-xs text-muted-foreground">Assignify © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;