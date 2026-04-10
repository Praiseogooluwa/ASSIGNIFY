import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, isPast } from "date-fns";
import { PlusCircle, Copy, Trash2, Eye, BookOpen, FileText, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import SidebarLayout from "@/components/SidebarLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/api/axios";

interface Assignment {
  id: string;
  course_name: string;
  title: string;
  submission_type: "individual" | "group";
  deadline: string;
  submission_count: number;
}

const Dashboard = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get("/assignments");
      setAssignments(data);
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assignment? This cannot be undone.")) return;
    try {
      await api.delete(`/assignments/${id}`);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Assignment deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/submit/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Submission link copied to clipboard!");
    }).catch(() => {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toast.success("Submission link copied!");
    });
  };

  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submission_count || 0), 0);
  const activeCount = assignments.filter((a) => !isPast(new Date(a.deadline))).length;

  return (
    <SidebarLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="font-display text-3xl text-foreground">My Assignments</h1>
          <Link to="/assignments/new">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Assignment
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Assignments", value: assignments.length, icon: BookOpen },
            { label: "Total Submissions", value: totalSubmissions, icon: FileText },
            { label: "Active", value: activeCount, icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg border p-5 flex items-center gap-4 border-l-4 border-l-primary">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Assignment Cards */}
        {loading ? (
          <LoadingSpinner />
        ) : assignments.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="font-display text-xl text-foreground mb-2">No assignments yet</h3>
            <p className="text-sm">Create your first assignment to get started.</p>
            <Link to="/assignments/new" className="inline-block mt-4">
              <Button variant="outline" className="gap-2">
                <PlusCircle className="h-4 w-4" /> Create Assignment
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((a) => {
              const closed = isPast(new Date(a.deadline));
              return (
                <div key={a.id} className="bg-card rounded-lg border p-5 space-y-3 hover:shadow-md transition-shadow duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">{a.course_name}</p>
                      <h3 className="font-display text-xl text-foreground mt-0.5">{a.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={a.submission_type === "group" ? "secondary" : "outline"}>
                        {a.submission_type === "group" ? "Group" : "Individual"}
                      </Badge>
                      <Badge className={closed ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"}>
                        {closed ? "Closed" : "Open"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>Deadline: {format(new Date(a.deadline), "EEE d MMM yyyy · h:mm a")}</span>
                      <span>{a.submission_count || 0} submissions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/assignments/${a.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => copyLink(a.id)}>
                        <Copy className="h-3.5 w-3.5" /> Copy Link
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
