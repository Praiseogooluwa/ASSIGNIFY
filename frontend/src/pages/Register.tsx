import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, CheckCircle2, Mail, AlertCircle, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/api/axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import AssignifyLogo from "@/components/AssignifyLogo";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// Replace with your actual site key. Use "1x00000000000000000000AA" for dev testing.
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";


function useTurnstile(onVerified: (token: string) => void, onExpired: () => void) {
  const widgetRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mount = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetRef.current) return;
    widgetRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => onVerified(token),
      "expired-callback": () => onExpired(),
      "error-callback": () => onExpired(),
      theme: "light",
      size: "normal",
    });
  }, [onVerified, onExpired]);

  const reset = useCallback(() => {
    if (widgetRef.current && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
    }
  }, []);

  return { containerRef, mount, reset };
}

type Step = "form" | "verify";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const { containerRef, mount, reset } = useTurnstile(
    (token) => setCaptchaToken(token),
    () => setCaptchaToken(null),
  );

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

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score, label: "Fair", color: "bg-orange-400" };
    if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (password !== confirmPassword) { setFormError("Passwords don't match"); return; }
    if (password.length < 8) { setFormError("Password must be at least 8 characters"); return; }
    if (!/[A-Z]/.test(password)) { setFormError("Password must contain at least one uppercase letter"); return; }
    if (!/[0-9]/.test(password)) { setFormError("Password must contain at least one number"); return; }
    if (!captchaToken) { setFormError("Please complete the security check."); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("cf_token", captchaToken);
      await api.post("/auth/register", formData);
      toast.success("Verification code sent to your email!");
      setStep("verify");
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.message || "";
      setFormError(detail || "Registration failed. Please try again.");
      reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("code", otp);
      const { data } = await api.post("/auth/verify", formData);
      localStorage.setItem("ap_token", data.token);
      toast.success("Account verified! Welcome to Assignify 🎉");
      navigate("/dashboard");
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.message || "Invalid code";
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      await api.post("/auth/resend-code", formData);
      toast.success("New code sent!");
    } catch {
      toast.error("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left — Brand panel ────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[48%] xl:w-[52%] bg-primary items-center justify-center overflow-hidden">
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
              Start managing<br />
              <span className="italic text-accent">smarter.</span>
            </h1>
            <p className="text-primary-foreground/60 text-base leading-relaxed">
              Join lecturers across Nigeria saving hours every week with Assignify.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: "Free to get started", sub: "No credit card, no setup fees" },
              { label: "No student accounts needed", sub: "Students just click the link" },
              { label: "Set up in under 2 minutes", sub: "Create your first assignment today" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12 }}
              >
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-1" />
                <div>
                  <p className="text-primary-foreground/85 text-sm font-medium">{item.label}</p>
                  <p className="text-primary-foreground/40 text-xs mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Shield className="h-3.5 w-3.5 text-accent/70" />
            <span className="text-primary-foreground/35 text-xs">NDPR-compliant · Supabase enterprise storage</span>
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
          <div className="lg:hidden mb-2">
            <AssignifyLogo size="sm" variant="dark" />
          </div>

          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display text-3xl font-normal text-foreground">Create your account</h2>
                  <p className="text-muted-foreground text-sm mt-1.5">Get started with Assignify for free</p>
                </div>

                {formError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3.5 flex items-start gap-2.5 text-sm animate-fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Dr. Jane Smith"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setFormError(""); }}
                      required
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regEmail" className="text-sm font-medium">Email address</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                      required
                      className={`h-12 text-base ${formError ? "border-destructive" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regPassword" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="regPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setFormError(""); }}
                        required
                        className="h-12 text-base pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="space-y-1 mt-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength.score >= i ? strength.color : "bg-muted"}`} />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${strength.score <= 1 ? "text-red-500" : strength.score <= 2 ? "text-orange-400" : strength.score <= 3 ? "text-yellow-600" : "text-emerald-600"}`}>
                          {strength.label} password{strength.score < 3 ? " — add uppercase, numbers, or symbols" : ""}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setFormError(""); }}
                      required
                      className="h-12 text-base"
                    />
                  </div>

                  {/* Cloudflare Turnstile */}
                  <div className="py-1">
                    <div ref={containerRef} />
                    {!captchaToken && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Complete the security check above to continue
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
                      : (<>Create Account <ArrowRight className="h-4 w-4" /></>)
                    }
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="font-display text-3xl font-normal text-foreground">Check your email</h2>
                  <p className="text-muted-foreground text-sm">
                    We sent a 6-digit code to<br />
                    <span className="font-semibold text-foreground">{email}</span>
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  className="w-full h-12 font-semibold text-base"
                  disabled={loading || otp.length !== 6}
                  onClick={handleVerify}
                >
                  {loading ? <LoadingSpinner className="p-0 [&_svg]:h-5 [&_svg]:w-5" /> : "Verify & Continue"}
                </Button>

                <div className="text-center space-y-2">
                  <button
                    onClick={handleResendCode}
                    disabled={resending}
                    className="text-sm text-primary hover:underline disabled:opacity-50 font-medium"
                  >
                    {resending ? "Sending..." : "Resend code"}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    <button onClick={() => setStep("form")} className="text-primary hover:underline">
                      Use a different email
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

export default Register;