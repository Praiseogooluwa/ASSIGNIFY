import { useState } from "react";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SidebarLayout from "@/components/SidebarLayout";
import api from "@/api/axios";

const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
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

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(newPassword);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("New password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("New password must contain at least one number");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("current_password", currentPassword);
      formData.append("new_password", newPassword);
      await api.post("/auth/change-password", formData);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to update password. Please try again.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="p-6 lg:p-10 max-w-xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm mb-8">Manage your account preferences</p>

        <div className="bg-card border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
              <p className="text-xs text-muted-foreground">Use a strong password you don't use elsewhere</p>
            </div>
          </div>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Password updated successfully
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPw">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPw"
                  type={showCurrent ? "text" : "password"}
                  placeholder="Your current password"
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setError(""); }}
                  required
                  className="h-11 pr-10"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPw">New Password</Label>
              <div className="relative">
                <Input
                  id="newPw"
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                  required
                  className="h-11 pr-10"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="space-y-1 mt-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map((i) => (
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
              <Label htmlFor="confirmPw">Confirm New Password</Label>
              <Input
                id="confirmPw"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                required
                className={`h-11 ${confirmPassword && confirmPassword !== newPassword ? "border-destructive" : ""}`}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-destructive">Passwords don't match</p>
              )}
            </div>

            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Settings;