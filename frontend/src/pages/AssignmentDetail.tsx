import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { format, isPast } from "date-fns";
import {
  Copy, Download, FileSpreadsheet, Upload, Search, ExternalLink, ChevronLeft, ChevronRight, XCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import SidebarLayout from "@/components/SidebarLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import api, { downloadBlob } from "@/api/axios";
import { API_BASE } from "@/config";

interface Assignment {
  id: string;
  course_name: string;
  title: string;
  submission_type: "individual" | "group";
  deadline: string;
  number_of_groups?: number;
  instructions?: string;
  is_closed?: boolean;
}

interface Submission {
  id: string;
  full_name: string;
  matric_number: string;
  department: string;
  group_number?: number;
  submitted_at: string;
  is_late: boolean;
  score?: number;
  file_url: string;
}

interface ClassListResult {
  total: number;
  submitted: number;
  missing: { full_name: string; matric_number: string; department: string }[];
}

const PAGE_SIZE = 25;

const AssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [classListOpen, setClassListOpen] = useState(false);
  const [classListResult, setClassListResult] = useState<ClassListResult | null>(null);
  const [uploadingClassList, setUploadingClassList] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [aRes, sRes, dRes] = await Promise.all([
        api.get(`/assignments/${id}`),
        api.get(`/submissions/${id}`, { params: { department: filterDept || undefined, group_number: filterGroup || undefined } }),
        api.get("/departments"),
      ]);
      setAssignment(aRes.data);
      setSubmissions(sRes.data);
      setDepartments(dRes.data?.map?.((d: any) => d.name || d) || []);
    } catch {
      toast.error("Failed to load assignment data");
    } finally {
      setLoading(false);
    }
  }, [id, filterDept, filterGroup]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const copyLink = () => {
    const url = `${window.location.origin}/submit/${id}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => toast.success("Submission link copied!"));
    } else {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toast.success("Submission link copied!");
    }
  };

  const handleDownloadZip = async (mode: string, filterValue?: string) => {
    try {
      const params: any = { mode };
      if (filterValue) params.filter_value = filterValue;
      const res = await api.get(`/download/${id}/zip`, { params, responseType: "blob" });
      downloadBlob(res.data, `submissions-${mode}.zip`);
    } catch {
      toast.error("Download failed");
    }
  };

  const handleExportExcel = async (department?: string) => {
    try {
      const res = await api.get(`/export/${id}/excel`, {
        params: department ? { department } : undefined,
        responseType: "blob",
      });
      downloadBlob(res.data, department ? `${department}.xlsx` : "submissions.zip");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleScoreUpdate = async (subId: string, score: string) => {
    if (!score) return;
    try {
      const formData = new FormData();
      formData.append("score", score);
      await api.patch(`/submissions/${subId}/score`, formData);
      toast.success("Score saved");
    } catch {
      toast.error("Failed to update score");
    }
  };

  const handleClassListUpload = async (file: File) => {
    setUploadingClassList(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(`/assignments/${id}/classlist`, formData);
      setClassListResult(data);
    } catch {
      toast.error("Failed to upload class list");
    } finally {
      setUploadingClassList(false);
    }
  };

  const handleCloseAssignment = async () => {
    setClosing(true);
    try {
      await api.patch(`/assignments/${id}/close`);
      setAssignment((prev) => prev ? { ...prev, is_closed: true } : prev);
      toast.success("Assignment closed successfully");
      setCloseDialogOpen(false);
    } catch {
      toast.error("Failed to close assignment");
    } finally {
      setClosing(false);
    }
  };

  const downloadMissingCSV = () => {
    if (!classListResult?.missing) return;
    const csv = "Full Name,Matric Number,Department\n" + classListResult.missing.map((m) => `${m.full_name},${m.matric_number},${m.department}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, "missing-students.csv");
  };

  // Open file via backend proxy — hides Supabase URL completely
  const openFile = (submission: Submission) => {
    // file_url is now /files/:id from backend
    // We need to open it via the backend URL with auth token
    const token = localStorage.getItem("ap_token");
    const fileUrl = `${API_BASE}/files/${submission.id}`;
    // Open in new tab with token in URL as query param for auth
    window.open(`${fileUrl}?token=${token}`, "_blank");
  };

  if (loading) return <SidebarLayout><LoadingSpinner /></SidebarLayout>;
  if (!assignment) return <SidebarLayout><p className="p-8 text-muted-foreground">Assignment not found.</p></SidebarLayout>;

  const isClosed = assignment.is_closed || isPast(new Date(assignment.deadline));
  const isManuallyCllosed = assignment.is_closed && !isPast(new Date(assignment.deadline));

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.full_name.toLowerCase().includes(q) || s.matric_number.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const lateCount = submissions.filter((s) => s.is_late).length;

  return (
    <SidebarLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-primary uppercase tracking-widest">{assignment.course_name}</p>
          <h1 className="font-display text-3xl font-bold text-foreground">{assignment.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span>Deadline: {format(new Date(assignment.deadline), "EEE d MMM yyyy · h:mm a")}</span>
            {assignment.is_closed ? (
              <Badge className="bg-destructive text-destructive-foreground">Closed by Lecturer</Badge>
            ) : isPast(new Date(assignment.deadline)) ? (
              <Badge className="bg-destructive text-destructive-foreground">Deadline Passed</Badge>
            ) : (
              <Badge className="bg-success text-success-foreground">Open</Badge>
            )}
          </div>
        </div>

        {/* Assignment Brief */}
        {assignment.instructions && (
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowBrief(!showBrief)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                Assignment Brief
              </span>
              {showBrief ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showBrief && (
              <div className="px-5 py-4 bg-white border-t border-border">
                <p className="font-display text-base text-foreground whitespace-pre-wrap leading-relaxed">
                  {assignment.instructions}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={copyLink}>
            <Copy className="h-4 w-4" /> Copy Submission Link
          </Button>

          {!assignment.is_closed && !isPast(new Date(assignment.deadline)) && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
              onClick={() => setCloseDialogOpen(true)}
            >
              <XCircle className="h-4 w-4" /> Close Assignment
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" /> Download ZIP
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDownloadZip("all")}>Download All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const g = prompt("Enter group number:"); if (g) handleDownloadZip("group", g); }}>
                Download by Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const d = prompt("Enter department name:"); if (d) handleDownloadZip("department", d); }}>
                Download by Department
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <FileSpreadsheet className="h-4 w-4" /> Export Excel
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportExcel()}>Export All Departments</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const d = prompt("Enter department name:"); if (d) handleExportExcel(d); }}>
                Export by Department
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setClassListOpen(true)}>
            <Upload className="h-4 w-4" /> Upload Class List
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Department</Label>
            <select
              value={filterDept}
              onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {assignment.submission_type === "group" && (
            <div className="space-y-1">
              <Label className="text-xs">Group #</Label>
              <Input
                className="w-24 h-9"
                type="number"
                min={1}
                value={filterGroup}
                onChange={(e) => { setFilterGroup(e.target.value); setPage(1); }}
                placeholder="All"
              />
            </div>
          )}
          <div className="space-y-1 flex-1 min-w-[200px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9"
                placeholder="Name or matric number..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{submissions.length}</strong> submissions</span>
          <span><strong className="text-destructive">{lateCount}</strong> late</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">S/N</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Full Name</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Matric No.</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Department</th>
                {assignment.submission_type === "group" && <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Group</th>}
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Submitted At</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Late?</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Score</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">File</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s, i) => (
                <tr key={s.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${s.is_late ? "border-l-4 border-l-destructive" : ""}`}>
                  <td className="px-4 py-3 text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3 font-medium">{s.full_name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.matric_number}</td>
                  <td className="px-4 py-3">{s.department}</td>
                  {assignment.submission_type === "group" && <td className="px-4 py-3">{s.group_number ? `Group ${s.group_number}` : "—"}</td>}
                  <td className="px-4 py-3 text-muted-foreground">{format(new Date(s.submitted_at), "d MMM yyyy h:mm a")}</td>
                  <td className="px-4 py-3">{s.is_late ? <Badge className="bg-destructive/10 text-destructive text-xs border-0">Late</Badge> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3">
                    <Input
                      className="w-20 h-8 text-center font-mono"
                      type="number"
                      defaultValue={s.score ?? ""}
                      onBlur={(e) => handleScoreUpdate(s.id, e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => openFile(s)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View File
                    </Button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">No submissions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Close Assignment Dialog */}
        <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close this assignment?</AlertDialogTitle>
              <AlertDialogDescription>
                Students will no longer be able to submit once you close this assignment. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCloseAssignment}
                className="bg-destructive hover:bg-destructive/90"
                disabled={closing}
              >
                {closing ? "Closing..." : "Yes, Close Assignment"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Class List Modal */}
        <Dialog open={classListOpen} onOpenChange={setClassListOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Class List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with columns: <code className="bg-muted px-1 rounded text-xs">full_name, matric_number, department</code>
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => { const file = e.target.files?.[0]; if (file) handleClassListUpload(file); }}
              />
              {uploadingClassList && <LoadingSpinner className="p-4" />}
              {classListResult && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="font-bold text-lg">{classListResult.total}</p>
                      <p className="text-muted-foreground text-xs">Total</p>
                    </div>
                    <div className="bg-success/10 rounded-lg p-3 text-center">
                      <p className="font-bold text-lg text-success">{classListResult.submitted}</p>
                      <p className="text-muted-foreground text-xs">Submitted</p>
                    </div>
                    <div className="bg-destructive/10 rounded-lg p-3 text-center">
                      <p className="font-bold text-lg text-destructive">{classListResult.missing.length}</p>
                      <p className="text-muted-foreground text-xs">Missing</p>
                    </div>
                  </div>
                  {classListResult.missing.length > 0 && (
                    <>
                      <p className="text-sm font-medium text-destructive">{classListResult.missing.length} students haven't submitted</p>
                      <div className="max-h-40 overflow-y-auto border rounded-lg">
                        <table className="w-full text-xs">
                          <thead><tr className="border-b bg-muted/50"><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Matric</th><th className="px-3 py-2 text-left">Dept</th></tr></thead>
                          <tbody>
                            {classListResult.missing.map((m, i) => (
                              <tr key={i} className="border-b last:border-0"><td className="px-3 py-2">{m.full_name}</td><td className="px-3 py-2 font-mono">{m.matric_number}</td><td className="px-3 py-2">{m.department}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Button variant="outline" size="sm" onClick={downloadMissingCSV}>Download Missing List (CSV)</Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  );
};

export default AssignmentDetail;