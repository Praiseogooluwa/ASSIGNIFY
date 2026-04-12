import { Link } from "react-router-dom";
import { CheckCircle, FileText, BarChart2, Download, Shield, Clock, ArrowRight, GraduationCap, Users, Zap } from "lucide-react";
import AssignifyLogo from "@/components/AssignifyLogo";

const features = [
  {
    icon: FileText,
    title: "Create in seconds",
    desc: "Set up an assignment with deadline, instructions and submission type. Share one link — students submit directly.",
  },
  {
    icon: CheckCircle,
    title: "Track every submission",
    desc: "See who submitted, who's missing, and who submitted late. All in one clean dashboard.",
  },
  {
    icon: BarChart2,
    title: "Collate CA scores",
    desc: "Select multiple assignments and generate a department-by-department CA report. Download as Excel in one click.",
  },
  {
    icon: Download,
    title: "Download all files",
    desc: "Download all student submissions as a ZIP file, organised by department or group automatically.",
  },
  {
    icon: Shield,
    title: "Upload your class list",
    desc: "Upload your register in Excel, Word, PDF or CSV. Instantly see who from your class is missing.",
  },
  {
    icon: Clock,
    title: "Auto deadline control",
    desc: "Submissions close automatically when the deadline passes. Late submissions are flagged automatically.",
  },
];

const stats = [
  { value: "1 link", label: "to share with your class" },
  { value: "0 emails", label: "chasing students" },
  { value: "instant", label: "Excel CA report" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0a1a14] text-white overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1a14]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <AssignifyLogo size="md" variant="light" showText={true} />
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-[#0a846b] hover:bg-[#0b9278] text-white px-5 py-2 rounded-lg font-medium transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#0a846b]/15 rounded-full blur-3xl pointer-events-none" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#1abb9b 1px, transparent 1px), linear-gradient(90deg, #1abb9b 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#0a846b]/20 border border-[#0a846b]/40 text-[#1abb9b] text-xs font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-[#1abb9b] rounded-full animate-pulse" />
            Built for Nigerian university lecturers
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-normal leading-tight mb-6"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Your assignments,{" "}
            <span className="italic text-[#1abb9b]">finally organised.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create assignments, share one link, collect submissions and generate 
            your CA report — all without WhatsApp groups, emails or spreadsheet chaos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 bg-[#0a846b] hover:bg-[#0b9278] text-white text-base font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#0a846b]/30"
            >
              Start for free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-base px-6 py-4 transition-colors"
            >
              Already have an account →
            </Link>
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="relative max-w-4xl mx-auto mt-20">
          <div className="bg-[#101822] rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0d1520]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-[#1abb9b]/60" />
              <div className="flex-1 mx-4 bg-white/5 rounded-md h-6 flex items-center px-3">
                <span className="text-white/30 text-xs">assignify.com.ng/dashboard</span>
              </div>
            </div>
            {/* Mock dashboard content */}
            <div className="p-6 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Assignments", value: "12" },
                  { label: "Total Submissions", value: "247" },
                  { label: "Active", value: "3" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-white/40 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Assignment cards */}
              {[
                { course: "MAT102", title: "Mid-Semester Assignment", count: 89, level: "100L", open: true },
                { course: "EST301", title: "Research Paper Submission", count: 43, level: "300L", open: true },
                { course: "PHY101", title: "Lab Report 1", count: 115, level: "100L", open: false },
              ].map((a) => (
                <div key={a.title} className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#1abb9b] uppercase tracking-wider mb-1">{a.course}</p>
                    <p className="text-sm text-white font-medium">{a.title}</p>
                    <p className="text-xs text-white/40 mt-1">{a.count} submissions · {a.level}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${a.open ? "bg-[#0a846b]/20 text-[#1abb9b]" : "bg-red-500/20 text-red-400"}`}>
                    {a.open ? "Open" : "Closed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Glow under mockup */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-[#0a846b]/20 blur-2xl rounded-full" />
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl md:text-5xl font-bold text-[#1abb9b]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {s.value}
              </p>
              <p className="text-sm text-white/50 mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-normal mb-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Everything a lecturer needs
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              No complex setup. No training required. Works the way you already think about assignments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-[#0a846b]/30 rounded-2xl p-6 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-[#0a846b]/15 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0a846b]/25 transition-colors">
                  <f.icon className="h-5 w-5 text-[#1abb9b]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#080f0c]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-normal mb-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Simple as sharing a link
            </h2>
            <p className="text-white/50 text-lg">Three steps. That's it.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                icon: GraduationCap,
                title: "Create your assignment",
                desc: "Set the course, title, deadline and whether it's individual or group. Takes 30 seconds.",
              },
              {
                step: "02",
                icon: Users,
                title: "Share the link",
                desc: "Copy the submission link and share it on WhatsApp, email or wherever you reach your students. No accounts needed for them.",
              },
              {
                step: "03",
                icon: Zap,
                title: "Download your report",
                desc: "When the deadline passes, open collation, upload your class list, and download a department-by-department Excel CA report.",
              },
            ].map((s, i) => (
              <div key={s.step} className="flex gap-6 bg-white/[0.03] border border-white/5 rounded-2xl p-6">
                <div className="shrink-0 w-12 h-12 bg-[#0a846b]/15 rounded-xl flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-[#1abb9b]" />
                </div>
                <div>
                  <p className="text-xs text-[#1abb9b] font-bold tracking-widest mb-1">STEP {s.step}</p>
                  <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-[#0a846b]/30 to-[#101822] border border-[#0a846b]/30 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[#0a846b]/5 rounded-3xl" />
            <div className="relative">
              <AssignifyLogo size="lg" variant="light" showText={true} />
              <h2
                className="text-4xl font-normal mt-6 mb-4"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Ready to simplify your semester?
              </h2>
              <p className="text-white/60 mb-8 text-lg">
                Free for all lecturers. No credit card. No setup fees.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[#0a846b] hover:bg-[#0b9278] text-white text-base font-semibold px-10 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#0a846b]/30"
              >
                Create your account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <AssignifyLogo size="sm" variant="light" showText={true} />
          <p className="text-xs text-white/30 text-center">
            Built by{" "}
            <a
              href="https://github.com/Praiseogooluwa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1abb9b] hover:underline"
            >
              Isaiah Ogooluwa Bakare
            </a>{" "}
            · © 2026 Assignify
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <a href="mailto:support@assignify.com.ng" className="hover:text-white/70 transition-colors">
              support@assignify.com.ng
            </a>
            <Link to="/login" className="hover:text-white/70 transition-colors">
              Lecturer Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;