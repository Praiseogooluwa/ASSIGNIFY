import { useState } from "react";
import { Search, CheckCircle2, XCircle, Clock, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AssignifyLogo from "@/components/AssignifyLogo";
import api from "@/api/axios";

interface SubmissionRecord {
  id: string;
  matric_number: string;
  full_name: string;
  submitted_at: string;
  is_late: boolean;
  course_name: string;
  assignment_title: string;
  deadline: string;
}

interface CheckResult {
  found: boolean;
  matric: string;
  name: string;
  submissions: SubmissionRecord[];
}

const CheckStatus = () => {
  const [matric, setMatric] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matric.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.get(`/submissions/check?matric=${encodeURIComponent(matric.trim())}`);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <AssignifyLogo size="sm" variant="dark" />
        <a
          href="mailto:support@assignify.com.ng"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          support@assignify.com.ng
        </a>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg space-y-8"
        >
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Search className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Check Submission Status</h1>
            <p className="text-muted-foreground text-sm">
              Enter your matric number to verify that your assignment was received
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleCheck} className="flex gap-2">
            <Input
              placeholder="Enter your matric number e.g. 190403001"
              value={matric}
              onChange={(e) => { setMatric(e.target.value); setError(""); }}
              className="h-12 text-base"
              autoFocus
            />
            <Button type="submit" className="h-12 px-6 font-semibold shrink-0" disabled={loading || !matric.trim()}>
              {loading ? "Checking..." : "Check"}
            </Button>
          </form>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Not found */}
                {!result.found ? (
                  <div className="bg-card border rounded-xl p-6 text-center space-y-3">
                    <XCircle className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                    <div>
                      <p className="font-semibold text-foreground">No submissions found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        No record of <strong>{matric.toUpperCase()}</strong> submitting any assignment.
                        Check your matric number and try again.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Found header */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">{result.name}</p>
                        <p className="text-xs text-muted-foreground">{result.matric} · {result.submissions.length} submission{result.submissions.length !== 1 ? "s" : ""} found</p>
                      </div>
                    </div>

                    {/* Submission list */}
                    <div className="space-y-3">
                      {result.submissions.map((sub, i) => (
                        <motion.div
                          key={sub.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="bg-card border rounded-xl p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <BookOpen className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-primary uppercase tracking-wider">
                                  {sub.course_name}
                                </p>
                                <p className="font-semibold text-foreground text-sm leading-tight">
                                  {sub.assignment_title}
                                </p>
                              </div>
                            </div>
                            {sub.is_late ? (
                              <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                                Late
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                                On time
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground pl-10">
                            <Clock className="h-3 w-3" />
                            <span>Submitted {format(new Date(sub.submitted_at), "EEE d MMM yyyy · h:mm a")}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        Assignify © {new Date().getFullYear()} · assignify.com.ng
      </div>
    </div>
  );
};

export default CheckStatus;