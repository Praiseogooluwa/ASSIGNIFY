import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format, isPast } from "date-fns";
import {
  ArrowLeft, BookOpen, PlusCircle, Eye, Copy,
  Trash2, Clock, FileText, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import SidebarLayout from "@/components/SidebarLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/api/axios";

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  target_level?: string;
  semester_id: string;
}

interface Assignment {
  id: string;
  course_name: string;
  title: string;
  submission_type: "individual" | "group";
  deadline: string;
  submission_count: number;
  target_level?: string;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch course info
        const { data: allCourses } = await api.get("/courses");
        const found = allCourses.find((c: Course) => c.id === id);
        if (!found) { navigate("/courses"); return; }
        setCourse(found);

        // Fetch assignments for this course
        const { data: allAssignments } = await api.get("/assignments");
        const filtered = allAssignments.filter((a: Assignment & { course_id?: string }) => a.course_id === id);
        setAssignments(filtered);
      } catch {
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const copyLink = (assignmentId: string) => {
    const url = `${window.location.origin}/submit/${assignmentId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Submission link copied!");
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

  const handleDelete = async (assignmentId: string) => {
    if (!confirm("Delete this assignment? This cannot be undone.")) return;
    try {
      await api.delete(`/assignments/${assignmentId}`);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      toast.success("Assignment deleted");
    } catch { toast.error("Failed to delete"); }
  };

  if (loading) return <SidebarLayout><LoadingSpinner /></SidebarLayout>;
  if (!course) return null;

  const totalSubs = assignments.reduce((s, a) => s + (a.submission_count || 0), 0);
  const activeCount = assignments.filter((a) => !isPast(new Date(a.deadline))).length;

  return (
    <SidebarLayout>
      <div className="p-6 lg:p-8 space-y-6">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate("/courses")} className="flex items-center gap-1 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Courses
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{course.course_code}</span>
        </div>

        {/* ── Course header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">{course.course_code}</h1>
                {course.target_level && (
                  <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                    {course.target_level}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-0.5">{course.course_name}</p>
            </div>
          </div>

          <Link to={`/assignments/new?course_id=${course.id}&course_code=${course.course_code}`}>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" /> New Assignment
            </Button>
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Assignments", value: assignments.length, icon: FileText },
            { label: "Submissions", value: totalSubs, icon: FileText },
            { label: "Active", value: activeCount, icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border p-4 flex items-center gap-3 border-l-4 border-l-primary">
              <div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Assignments list ── */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Assignments</h2>

          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl space-y-3">
              <FileText className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No assignments yet for this course</p>
              <Link to={`/assignments/new?course_id=${course.id}&course_code=${course.course_code}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <PlusCircle className="h-3.5 w-3.5" /> Create First Assignment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {assignments.map((a, i) => {
                const closed = isPast(new Date(a.deadline));
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border p-4 space-y-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{a.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Deadline: {format(new Date(a.deadline), "EEE d MMM yyyy · h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={a.submission_type === "group" ? "secondary" : "outline"} className="text-xs">
                          {a.submission_type}
                        </Badge>
                        <Badge className={`text-xs ${closed ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"}`}>
                          {closed ? "Closed" : "Open"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{a.submission_count || 0} submissions</span>
                      <div className="flex items-center gap-2">
                        <Link to={`/assignments/${a.id}`}>
                          <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
                            <Eye className="h-3 w-3" /> View
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="gap-1 h-8 text-xs" onClick={() => copyLink(a.id)}>
                          <Copy className="h-3 w-3" /> Copy Link
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 h-8 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(a.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default CourseDetail;