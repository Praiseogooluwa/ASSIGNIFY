import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Users, LogOut, ShieldCheck, Eye, Search, BookOpen, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import AssignifyLogo from "@/components/AssignifyLogo";
import { adminApi as api } from "@/api/axios";

interface Lecturer {
  id: string;
  full_name: string;
  display_name: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  assignment_count: number;
  submission_count: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const fetchLecturers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/lecturers");
      setLecturers(data);
    } catch (err: any) {
      toast.error("Failed to load lecturers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLecturers(); }, []);

  const impersonateLecturer = async (lecturerId: string) => {
    setImpersonating(lecturerId);
    try {
      const res = await api.post(`/admin/impersonate/${lecturerId}`, {});

      // Save the impersonation token as the lecturer token
      localStorage.setItem("ap_token", res.data.token);
      localStorage.setItem("ap_impersonating", "true");

      toast.success("Entering lecturer portal...");

      // Navigate in same tab using React Router (no page reload needed)
      navigate("/dashboard");

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Failed to access lecturer portal");
      setImpersonating(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ap_admin_token");
    navigate("/admin/login");
  };

  const filtered = lecturers.filter(
    (l) =>
      l.full_name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalAssignments = lecturers.reduce((sum, l) => sum + l.assignment_count, 0);
  const totalSubmissions = lecturers.reduce((sum, l) => sum + l.submission_count, 0);
  const verified = lecturers.filter((l) => l.is_verified).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-[#0a1a14] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AssignifyLogo size="sm" variant="light" showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-white font-semibold text-sm">Super Admin</span>
            </div>
            <p className="text-white/40 text-xs">Full system access</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors duration-150"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-foreground">Lecturer Management</h1>
            <p className="text-muted-foreground text-sm mt-1">
              View all registered lecturers and access their portals
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLecturers} className="gap-2 w-fit">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Lecturers", value: lecturers.length, icon: Users },
            { label: "Verified", value: verified, icon: ShieldCheck },
            { label: "Assignments", value: totalAssignments, icon: BookOpen },
            { label: "Submissions", value: totalSubmissions, icon: FileText },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg border p-4 flex items-center gap-3 border-l-4 border-l-primary">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : lecturers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-lg border">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No lecturers yet</p>
            <p className="text-sm mt-1">Lecturers will appear here once they create assignments</p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Assignments</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Submissions</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Joined</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{l.display_name || l.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{l.email}</td>
                    <td className="px-4 py-3">
                      {l.is_verified ? (
                        <Badge className="bg-success/10 text-success border-0 text-xs">Verified</Badge>
                      ) : (
                        <Badge className="bg-destructive/10 text-destructive border-0 text-xs">Unverified</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">{l.assignment_count}</td>
                    <td className="px-4 py-3">{l.submission_count}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {l.created_at ? format(new Date(l.created_at), "d MMM yyyy") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
                        disabled={impersonating === l.id}
                        onClick={() => impersonateLecturer(l.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {impersonating === l.id ? "Opening..." : "View Portal"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      No lecturers match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;