import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Mail, Phone, AlertCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import AssignifyLogo from "@/components/AssignifyLogo";

// ── Cloudflare Turnstile ─────────────────────────────────────────────────────
// Replace with your actual Turnstile site key from dash.cloudflare.com → Turnstile
// Use "1x00000000000000000000AA" for local testing (always passes)
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";


function useTurnstile(onVerified: (token: string) => void, onExpired: () => void) {
  const widgetRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const mount = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;
    if (widgetRef.current) return; // already mounted
    widgetRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => { setReady(true); onVerified(token); },
      "expired-callback": () => { setReady(false); onExpired(); },
      "error-callback": () => { setReady(false); onExpired(); },
      theme: "light",
      size: "normal",
    });
  }, [onVerified, onExpired]);

  const reset = useCallback(() => {
    if (widgetRef.current && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
      setReady(false);
    }
  }, []);

  return { containerRef, ready, mount, reset };
}

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const { containerRef, ready, mount, reset } = useTurnstile(
    (token) => setCaptchaToken(token),
    () => setCaptchaToken(null),
  );

  // Mount Turnstile once the script loads
  const scriptRef = useRef(false);
  if (!scriptRef.current) {
    scriptRef.current = true;
    if (!document.querySelector("#cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = () => setTimeout(mount, 100);
      document.head.appendChild(script);
    } else {
      setTimeout(mount, 100);
    }
  }

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
      reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left — Brand panel ────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[48%] xl:w-[52%] bg-primary items-center justify-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary-foreground/5 blur-3xl animate-pulse-glow [animation-delay:1.5s]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <motion.div
          className="relative z-10 max-w-md px-10 space-y-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <AssignifyLogo size="lg" variant="light" showText={false} />

          <div className="space-y-4">
            <h1 className="font-display text-5xl font-normal text-primary-foreground leading-[1.1]">
              Your assignments,<br />
              <span className="italic text-accent">simplified.</span>
            </h1>
            <p className="text-primary-foreground/60 text-base leading-relaxed">
              Create, collect, and grade — all from one beautiful dashboard. Built specifically for Nigerian university lecturers.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: "Create & share in seconds", sub: "One link, no student accounts needed" },
              { label: "Auto-track late work", sub: "See who submitted and when" },
              { label: "Export scores instantly", sub: "Full CA report in one click" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12 }}
              >
                <div className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" />
                <div>
                  <p className="text-primary-foreground/85 text-sm font-medium">{item.label}</p>
                  <p className="text-primary-foreground/40 text-xs mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-2 pt-2">
            <Shield className="h-3.5 w-3.5 text-accent/70" />
            <span className="text-primary-foreground/35 text-xs">Secured with NDPR-compliant data storage</span>
          </div>
        </motion.div>
      </div>

      {/* ── Right — Form ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col p-6 sm:p-10 lg:p-14 bg-background">
        <motion.div
          className="w-full max-w-md mx-auto space-y-7 flex-1 flex flex-col justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-2">
            <AssignifyLogo size="sm" variant="dark" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Lecturer Portal</p>
            <h2 className="font-display text-3xl font-normal text-foreground">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-1.5">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3.5 flex items-start gap-2.5 text-sm animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
                className={`h-12 text-base ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                  className={`h-12 text-base pr-11 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Cloudflare Turnstile */}
            <div className="py-1">
              <div ref={containerRef} />
              {!captchaToken && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Complete the security check above to sign in
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-semibold gap-2 text-base"
              disabled={loading || !captchaToken}
            >
              {loading
                ? <LoadingSpinner className="p-0 [&_svg]:h-5 [&_svg]:w-5" />
                : (<>Sign In <ArrowRight className="h-4 w-4" /></>)
              }
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
        <div className="w-full max-w-md mx-auto border-t border-border pt-5 mt-5 space-y-1.5">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="mailto:support@assignify.com.ng?subject=Assignify Support"
              className="flex items-center gap-1 hover:text-primary transition-colors">
              <Mail className="h-3 w-3" />
              <span>support@assignify.com.ng</span>
            </a>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Assignify © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;