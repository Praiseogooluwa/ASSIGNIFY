import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, PlusCircle, Trash2, ChevronRight,
  GraduationCap, BookMarked, AlertCircle, X, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import SidebarLayout from "@/components/SidebarLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/api/axios";

interface Session {
  id: string;
  title: string;
  is_current: boolean;
  semesters: Semester[];
}

interface Semester {
  id: string;
  session_id: string;
  name: "First" | "Second";
  is_active: boolean;
}

interface Course {
  id: string;
  semester_id: string;
  course_code: string;
  course_name: string;
  target_level?: string;
  assignment_count: number;
}

// ── Small modal shell ────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card rounded-2xl border shadow-2xl w-full max-w-md p-6 space-y-5"
        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const Courses = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<Session[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);

  // Modals
  const [showNewSession, setShowNewSession] = useState(false);
  const [showNewSemester, setShowNewSemester] = useState(false);
  const [showNewCourse, setShowNewCourse] = useState(false);

  // Forms
  const [sessionTitle, setSessionTitle] = useState("");
  const [semesterName, setSemesterName] = useState<"First" | "Second">("First");
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseLevel, setCourseLevel] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchSessions = async () => {
    try {
      const { data } = await api.get("/sessions");
      setSessions(data);
      const current = data.find((s: Session) => s.is_current) || data[0] || null;
      setActiveSession(current);
      if (current) {
        const activeSem = current.semesters?.find((s: Semester) => s.is_active)
          || current.semesters?.[0] || null;
        setActiveSemester(activeSem);
      }
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (semesterId: string) => {
    try {
      const { data } = await api.get(`/courses?semester_id=${semesterId}`);
      setCourses(data);
    } catch {
      toast.error("Failed to load courses");
    }
  };

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => {
    if (activeSemester) fetchCourses(activeSemester.id);
    else setCourses([]);
  }, [activeSemester]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCreateSession = async () => {
    if (!sessionTitle.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", sessionTitle.trim());
      await api.post("/sessions", fd);
      toast.success("Academic session created!");
      setSessionTitle("");
      setShowNewSession(false);
      fetchSessions();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create session");
    } finally { setSaving(false); }
  };

  const handleCreateSemester = async () => {
    if (!activeSession) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", semesterName);
      await api.post(`/sessions/${activeSession.id}/semesters`, fd);
      toast.success(`${semesterName} Semester created!`);
      setShowNewSemester(false);
      fetchSessions();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create semester");
    } finally { setSaving(false); }
  };

  const handleCreateCourse = async () => {
    if (!activeSemester || !courseCode.trim() || !courseName.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("semester_id", activeSemester.id);
      fd.append("course_code", courseCode.trim());
      fd.append("course_name", courseName.trim());
      if (courseLevel) fd.append("target_level", courseLevel);
      await api.post("/courses", fd);
      toast.success("Course created!");
      setCourseCode(""); setCourseName(""); setCourseLevel("");
      setShowNewCourse(false);
      fetchCourses(activeSemester.id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create course");
    } finally { setSaving(false); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Delete this course and all its assignments? This cannot be undone.")) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success("Course deleted");
    } catch { toast.error("Failed to delete course"); }
  };

  const switchSemester = async (sem: Semester) => {
    setActiveSemester(sem);
    try {
      await api.patch(`/semesters/${sem.id}/set-active`);
    } catch { /* non-critical */ }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return <SidebarLayout><LoadingSpinner /></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="p-6 lg:p-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Courses</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Organise your assignments and exams by course and semester
            </p>
          </div>
          <Button className="gap-2" onClick={() => setShowNewCourse(true)} disabled={!activeSemester}>
            <PlusCircle className="h-4 w-4" /> Add Course
          </Button>
        </div>

        {/* ── No sessions yet ── */}
        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-4"
          >
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Layers className="h-10 w-10 text-primary/60" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">No academic session yet</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                Start by creating your current academic session, e.g. "2025/2026"
              </p>
            </div>
            <Button className="gap-2" onClick={() => setShowNewSession(true)}>
              <PlusCircle className="h-4 w-4" /> Create Session
            </Button>
          </motion.div>
        ) : (
          <>
            {/* ── Session & Semester Selector ── */}
            <div className="bg-card border rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Session picker */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Session:</span>
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={async () => {
                        await api.patch(`/sessions/${s.id}/set-current`);
                        setActiveSession(s);
                        const sem = s.semesters?.find((x) => x.is_active) || s.semesters?.[0] || null;
                        setActiveSemester(sem);
                        fetchSessions();
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        activeSession?.id === s.id
                          ? "bg-primary text-white border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowNewSession(true)}
                    className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                  >
                    + New
                  </button>
                </div>
              </div>

              {/* Semester picker */}
              {activeSession && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Semester:</span>
                  {activeSession.semesters?.map((sem) => (
                    <button
                      key={sem.id}
                      onClick={() => switchSemester(sem)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        activeSemester?.id === sem.id
                          ? "bg-primary text-white border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {sem.name} Semester
                    </button>
                  ))}
                  <button
                    onClick={() => setShowNewSemester(true)}
                    className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                  >
                    + New
                  </button>
                </div>
              )}
            </div>

            {/* ── No semester selected ── */}
            {!activeSemester && activeSession && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">
                  Create a semester inside <strong>{activeSession.title}</strong> to start adding courses
                </p>
                <Button variant="outline" className="gap-2" onClick={() => setShowNewSemester(true)}>
                  <PlusCircle className="h-4 w-4" /> Add Semester
                </Button>
              </div>
            )}

            {/* ── Context label ── */}
            {activeSemester && activeSession && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  {activeSession.title} · {activeSemester.name} Semester
                </span>
                <span className="text-xs text-muted-foreground">
                  {courses.length} course{courses.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* ── Course grid ── */}
            {activeSemester && courses.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookMarked className="h-8 w-8 text-primary/60" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No courses yet</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Add your first course for {activeSemester.name} Semester
                  </p>
                </div>
                <Button className="gap-2" onClick={() => setShowNewCourse(true)}>
                  <PlusCircle className="h-4 w-4" /> Add Course
                </Button>
              </motion.div>
            )}

            {activeSemester && courses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {courses.map((course, i) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-card border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer relative"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      {/* Delete button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all duration-150"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {/* Course icon */}
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>

                      {/* Course info */}
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">
                        {course.course_code}
                      </p>
                      <h3 className="font-semibold text-foreground text-base leading-tight mb-3">
                        {course.course_name}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {course.target_level && (
                            <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                              {course.target_level}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {course.assignment_count} assignment{course.assignment_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add course card */}
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: courses.length * 0.05 }}
                  onClick={() => setShowNewCourse(true)}
                  className="bg-card border border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 min-h-[140px]"
                >
                  <PlusCircle className="h-6 w-6" />
                  <span className="text-sm font-medium">Add Course</span>
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal: New Session ── */}
      {showNewSession && (
        <Modal title="New Academic Session" onClose={() => setShowNewSession(false)}>
          <div className="space-y-2">
            <Label>Session Title</Label>
            <Input
              placeholder="e.g. 2025/2026"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Use the academic year format e.g. 2025/2026
            </p>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => setShowNewSession(false)}>Cancel</Button>
            <Button onClick={handleCreateSession} disabled={saving || !sessionTitle.trim()}>
              {saving ? "Creating..." : "Create Session"}
            </Button>
          </div>
        </Modal>
      )}

      {/* ── Modal: New Semester ── */}
      {showNewSemester && activeSession && (
        <Modal title={`Add Semester — ${activeSession.title}`} onClose={() => setShowNewSemester(false)}>
          <div className="space-y-2">
            <Label>Semester</Label>
            <div className="flex gap-3">
              {(["First", "Second"] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setSemesterName(n)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    semesterName === n
                      ? "bg-primary text-white border-primary"
                      : "border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {n} Semester
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => setShowNewSemester(false)}>Cancel</Button>
            <Button onClick={handleCreateSemester} disabled={saving}>
              {saving ? "Creating..." : "Create Semester"}
            </Button>
          </div>
        </Modal>
      )}

      {/* ── Modal: New Course ── */}
      {showNewCourse && activeSemester && activeSession && (
        <Modal
          title={`New Course — ${activeSession.title} · ${activeSemester.name} Semester`}
          onClose={() => setShowNewCourse(false)}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course Code</Label>
              <Input
                placeholder="e.g. MAT102"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input
                placeholder="e.g. Mathematics II"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Level <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
              <div className="flex flex-wrap gap-2">
                {["", "100L", "200L", "300L", "400L", "500L"].map((lvl) => (
                  <button
                    key={lvl || "none"}
                    type="button"
                    onClick={() => setCourseLevel(lvl)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      courseLevel === lvl
                        ? "bg-primary text-white border-primary"
                        : "border-border text-foreground hover:border-primary/50"
                    }`}
                  >
                    {lvl || "None"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => setShowNewCourse(false)}>Cancel</Button>
            <Button
              onClick={handleCreateCourse}
              disabled={saving || !courseCode.trim() || !courseName.trim()}
            >
              {saving ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </Modal>
      )}
    </SidebarLayout>
  );
};

export default Courses;