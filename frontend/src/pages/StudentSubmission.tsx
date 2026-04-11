import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { format, isPast, intervalToDuration } from "date-fns";
import { Upload, AlertCircle, X, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import AssignifyLogo from "@/components/AssignifyLogo";
import api from "@/api/axios";

interface Assignment {
  id: string;
  course_name: string;
  title: string;
  submission_type: "individual" | "group";
  deadline: string;
  instructions?: string | null;
  is_closed?: boolean;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Format helpers — ensures nice display even if lecturer typed in lowercase
const toTitleCase = (str: string) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

const toSentenceCase = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

const StudentSubmission = () => {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState({ name: "", matric: "", time: "" });
  const [countdown, setCountdown] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [briefOpen, setBriefOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: "",
    matric_number: "",
    department: "",
    group_number: "",
    file: null as File | null,
  });

  // Block back button — students should never navigate back to lecturer pages
  useEffect(() => {
    // Push a dummy state so that the back button hits this instead of /login or /register
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, dRes] = await Promise.all([
          api.get(`/assignments/${id}`),
          api.get("/departments"),
        ]);
        setAssignment(aRes.data);
        setDepartments(dRes.data?.map?.((d: any) => d.name || d) || []);
      } catch {
        toast.error("Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!assignment) return;
    const timer = setInterval(() => {
      const deadline = new Date(assignment.deadline);
      if (isPast(deadline)) {
        setCountdown("Deadline passed");
        clearInterval(timer);
        return;
      }
      const dur = intervalToDuration({ start: new Date(), end: deadline });
      setCountdown(
        `${dur.days || 0}d ${dur.hours || 0}h ${dur.minutes || 0}m ${dur.seconds || 0}s`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [assignment]);

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only PDF, DOC, and DOCX files are accepted.");
      setForm((p) => ({ ...p, file: null }));
      return;
    }
    setError("");
    setForm((p) => ({ ...p, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file) {
      setError("Please select a file.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("matric_number", form.matric_number.toUpperCase());
      formData.append("department", form.department);
      if (assignment?.submission_type === "group") {
        formData.append("group_number", form.group_number);
      }
      formData.append("file", form.file);

      await api.post(`/submissions/${id}`, formData, {
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      setSubmittedInfo({
        name: form.full_name,
        matric: form.matric_number.toUpperCase(),
        time: format(new Date(), "d MMM yyyy · h:mm a"),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const deadlinePassed = assignment ? isPast(new Date(assignment.deadline)) : false;
  const closed = assignment?.is_closed || deadlinePassed;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner />
    </div>
  );

  if (!assignment) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Assignment not found.</p>
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-6 max-w-md">
          <svg className="mx-auto" width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="40" fill="hsl(168, 85%, 28%)" opacity="0.1"/>
            <circle cx="40" cy="40" r="30" fill="hsl(168, 85%, 28%)" opacity="0.2"/>
            <circle cx="40" cy="40" r="20" fill="hsl(168, 85%, 28%)"/>
            <path d="M30 40L37 47L50 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="font-display text-3xl text-foreground">Submission Received!</h1>
          <div className="bg-card border rounded-lg p-5 space-y-1 text-muted-foreground">
            <p className="font-medium text-foreground">{submittedInfo.name}</p>
            <p className="font-mono text-sm">{submittedInfo.matric}</p>
            <p className="text-sm">{submittedInfo.time}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            ✅ Your submission has been recorded. You may now close this tab.
          </p>
          {/* NO link back to login/register/dashboard — students have no business there */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#0a1a14] py-8">
        <div className="max-w-lg mx-auto px-4 text-center space-y-3">
          <AssignifyLogo size="sm" variant="light" showText={true} />
          <p className="text-white/60 text-sm mt-4">{toTitleCase(assignment.course_name)}</p>
          <h1 className="font-display text-2xl text-white">{toTitleCase(assignment.title)}</h1>
          <div className="text-sm text-white/70">
            <p>Deadline: {format(new Date(assignment.deadline), "EEE d MMM yyyy · h:mm a")}</p>
            <p className={`font-mono text-xl mt-2 ${closed ? "text-red-400" : "text-emerald-400"}`}>
              {countdown}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Assignment Brief */}
        {assignment.instructions && (
          <div className="bg-card border rounded-lg overflow-hidden">
            <button
              onClick={() => setBriefOpen(!briefOpen)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors duration-150"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> View Assignment Brief
              </span>
              {briefOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: briefOpen ? "500px" : "0" }}
            >
              <div className="px-5 pb-5 pt-2">
                <div className="bg-muted/30 rounded-lg p-5 font-display text-base leading-relaxed text-foreground whitespace-pre-wrap">
                  {toSentenceCase(assignment.instructions || "")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Closed banners */}
        {assignment.is_closed && !deadlinePassed && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">This assignment has been closed by your lecturer.</p>
          </div>
        )}

        {deadlinePassed && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Submissions Closed — Deadline was {format(new Date(assignment.deadline), "d MMM yyyy h:mm a")}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`space-y-5 bg-card rounded-lg border p-6 ${closed ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              required
              className="focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matric">Matric Number</Label>
            <Input
              id="matric"
              placeholder="ABC/123/456"
              value={form.matric_number}
              onChange={(e) => setForm((p) => ({ ...p, matric_number: e.target.value.toUpperCase() }))}
              className="uppercase font-mono focus-visible:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept">Department</Label>
            <select
              id="dept"
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              required
            >
              <option value="">Select department</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {assignment.submission_type === "group" && (
            <div className="space-y-2">
              <Label htmlFor="group">Group Number</Label>
              <Input
                id="group"
                type="number"
                min={1}
                placeholder="e.g. 3"
                value={form.group_number}
                onChange={(e) => setForm((p) => ({ ...p, group_number: e.target.value }))}
                required
                className="focus-visible:ring-primary"
              />
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label>File Upload</Label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors duration-150"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFileSelect(e.dataTransfer.files[0]);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              {form.file ? (
                <div className="flex items-center justify-center gap-3">
                  <Upload className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{form.file.name}</p>
                    <p className="text-xs text-muted-foreground">{(form.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, file: null })); }}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click or drag & drop your file here</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOC, or DOCX only</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {submitting && uploadProgress > 0 && (
            <Progress value={uploadProgress} className="h-2" />
          )}

          <Button
            type="submit"
            className="w-full font-semibold h-12 bg-[#0a1a14] text-white hover:bg-[#0a1a14]/90"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Assignment"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">Assignify</span> · Built by Isaiah Ogooluwa Bakare
        </p>
      </div>
    </div>
  );
};

export default StudentSubmission;