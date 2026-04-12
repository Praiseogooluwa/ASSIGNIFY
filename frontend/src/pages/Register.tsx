import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, CheckCircle2, Mail, Phone, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/api/axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import AssignifyLogo from "@/components/AssignifyLogo";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (password !== confirmPassword) {
      setFormError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("email", email);
      formData.append("password", password);
      await api.post("/auth/register", formData);
      toast.success("Verification code sent to your email!");
      setStep("verify");
    } catch (err: any) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.response?.data?.message || "";

      if (status === 409) {
        // Email already registered — show error and offer to go to login
        setFormError("An account with this email already exists.");
      } else {
        setFormError(detail || "Registration failed. Please try again.");
      }
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
              Start managing<br />
              <span className="text-accent">smarter.</span>
            </h1>
            <p className="text-primary-foreground/60 text-base leading-relaxed pt-2">
              Join lecturers who save hours every week with Assignify.
            </p>
          </div>
          <div className="space-y-3 pt-4">
            {["Free to get started", "No credit card needed", "Set up in under 2 minutes"].map((text, i) => (
              <motion.div key={text} className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12 }}>
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Mobile brand */}
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
                  <h2 className="font-display text-2xl font-bold text-foreground">Create your account</h2>
                  <p className="text-muted-foreground text-sm mt-1">Get started with Assignify for free</p>
                </div>

                {/* Inline error — shows duplicate email with sign in link */}
                {formError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      {formError}
                      {formError.includes("already exists") && (
                        <> <Link to="/login" className="underline font-semibold">Sign in instead →</Link></>
                      )}
                    </span>
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
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regEmail" className="text-sm font-medium">Email</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                      required
                      className={`h-11 ${formError ? "border-destructive" : ""}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regPassword" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="regPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setFormError(""); }}
                        required
                        className="h-11 pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 font-semibold gap-2" disabled={loading}>
                    {loading ? <LoadingSpinner className="p-0 [&_svg]:h-5 [&_svg]:w-5" /> : (<>Create Account <ArrowRight className="h-4 w-4" /></>)}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
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
                  <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Check your email</h2>
                  <p className="text-muted-foreground text-sm">
                    We sent a 6-digit code to<br />
                    <span className="font-medium text-foreground">{email}</span>
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

                <Button className="w-full h-11 font-semibold" disabled={loading || otp.length !== 6} onClick={handleVerify}>
                  {loading ? <LoadingSpinner className="p-0 [&_svg]:h-5 [&_svg]:w-5" /> : "Verify & Continue"}
                </Button>

                <div className="text-center space-y-2">
                  <button onClick={handleResendCode} disabled={resending}
                    className="text-sm text-primary hover:underline disabled:opacity-50">
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

        <div className="w-full max-w-sm mx-auto border-t border-border pt-4 mt-4 space-y-1.5">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="mailto:support@assignify.com.ng?subject=Assignify Support"
              className="flex items-center gap-1 hover:text-primary transition-colors">
              <Mail className="h-3 w-3" />
              <span>support@assignify.com.ng</span>
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

export default Register;
