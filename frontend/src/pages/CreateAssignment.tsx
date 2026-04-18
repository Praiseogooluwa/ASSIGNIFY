import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import SidebarLayout from "@/components/SidebarLayout";
import api from "@/api/axios";

const CreateAssignment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    course_name: "",
    title: "",
    submission_type: "individual" as "individual" | "group",
    number_of_groups: 1,
    deadline_date: "",
    deadline_time: "",
    instructions: "",
    target_level: "",
  });

  // Capitalize each word for course name and title, sentence case for instructions
  const toTitleCase = (str: string) =>
    str.replace(/\b\w/g, (c) => c.toUpperCase());

  const toSentenceCase = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const update = (field: string, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("course_name", toTitleCase(form.course_name.trim()));
      formData.append("title", toTitleCase(form.title.trim()));
      formData.append("submission_type", form.submission_type);
      if (form.submission_type === "group") {
        formData.append("number_of_groups", String(form.number_of_groups));
      }
      const deadline = new Date(`${form.deadline_date}T${form.deadline_time}`).toISOString();
      formData.append("deadline", deadline);
      if (form.instructions.trim()) {
        formData.append("instructions", toSentenceCase(form.instructions.trim()));
      }
      if (form.target_level) {
        formData.append("target_level", form.target_level);
      }
      await api.post("/assignments", formData);
      toast.success("Assignment created! Share the submission link with your students.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="p-6 lg:p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-8">Create Assignment</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-lg border p-6">
          <div className="space-y-2">
            <Label htmlFor="course">Course Name</Label>
            <Input id="course" placeholder="e.g. MAT102" value={form.course_name} onChange={(e) => update("course_name", e.target.value)} required className="focus-visible:ring-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input id="title" placeholder="e.g. Mid-Semester Assignment" value={form.title} onChange={(e) => update("title", e.target.value)} required className="focus-visible:ring-primary" />
          </div>

          <div className="space-y-2">
            <Label>Target Level <span className="text-muted-foreground font-normal">(optional — used for collation filtering)</span></Label>
            <div className="flex flex-wrap gap-2">
              {["", "100L", "200L", "300L", "400L", "500L"].map((lvl) => (
                <button
                  key={lvl || "none"}
                  type="button"
                  onClick={() => update("target_level", lvl)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-150 ${
                    form.target_level === lvl
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {lvl || "Not specified"}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Tag this assignment so lecturers can filter collation reports by level (e.g. see only 100L students' completion).
            </p>
          </div>

          <div className="space-y-2">
            <Label>Assignment Instructions (optional)</Label>
            <Textarea
              placeholder="Describe the assignment, requirements, marking scheme..."
              value={form.instructions}
              onChange={(e) => update("instructions", e.target.value)}
              rows={4}
              className="focus-visible:ring-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Submission Type</Label>
            <div className="flex gap-4">
              {(["individual", "group"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update("submission_type", type)}
                  className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors duration-150 capitalize ${
                    form.submission_type === type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {form.submission_type === "group" && (
            <div className="space-y-2">
              <Label htmlFor="groups">Number of Groups</Label>
              <Input
                id="groups"
                type="number"
                min={1}
                value={form.number_of_groups}
                onChange={(e) => update("number_of_groups", parseInt(e.target.value) || 1)}
                className="focus-visible:ring-primary"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Deadline Date</Label>
              <Input id="date" type="date" value={form.deadline_date} onChange={(e) => update("deadline_date", e.target.value)} required className="focus-visible:ring-primary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Deadline Time</Label>
              <Input id="time" type="time" value={form.deadline_time} onChange={(e) => update("deadline_time", e.target.value)} required className="focus-visible:ring-primary" />
            </div>
          </div>

          <Button type="submit" className="w-full font-semibold" disabled={loading}>
            {loading ? "Creating..." : "Create Assignment"}
          </Button>
        </form>
      </div>
    </SidebarLayout>
  );
};

export default CreateAssignment;