import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CheckCircle, FileText, BarChart2, Download,
  Shield, Clock, GraduationCap, Users, Zap, ChevronDown,
  Star, Menu, X,
} from "lucide-react";
import AssignifyLogo from "@/components/AssignifyLogo";

const features = [
  {
    icon: FileText,
    title: "Create in 30 seconds",
    desc: "Set course, title, deadline, individual or group. One link is generated — share it anywhere.",
    color: "from-emerald-500/10 to-transparent",
  },
  {
    icon: CheckCircle,
    title: "Track every submission",
    desc: "Real-time dashboard shows who submitted, who's missing, and who came in late.",
    color: "from-teal-500/10 to-transparent",
  },
  {
    icon: BarChart2,
    title: "CA collation report",
    desc: "Select all semester assignments, upload your register, download a department-by-department Excel report.",
    color: "from-green-500/10 to-transparent",
  },
  {
    icon: Download,
    title: "Download all files",
    desc: "One click gets you a ZIP of all submissions, organised by department and group automatically.",
    color: "from-emerald-500/10 to-transparent",
  },
  {
    icon: Shield,
    title: "Class list upload",
    desc: "Upload your register in Excel, Word, PDF or CSV. See exactly who from your class is missing.",
    color: "from-teal-500/10 to-transparent",
  },
  {
    icon: Clock,
    title: "Deadline control",
    desc: "Close early, extend the deadline, or reopen — all with one click from your dashboard.",
    color: "from-green-500/10 to-transparent",
  },
];

const steps = [
  {
    n: "01",
    icon: GraduationCap,
    title: "Create your assignment",
    desc: "Enter the course name, title, deadline and submission type. Tag it as 100L, 200L or any level. Done in under a minute.",
  },
  {
    n: "02",
    icon: Users,
    title: "Share the link",
    desc: "Copy the submission link and paste it in your WhatsApp group, email or wherever you reach your students. No accounts needed for them.",
  },
  {
    n: "03",
    icon: Zap,
    title: "Collect and report",
    desc: "Students submit their files. You see who's done and who's missing in real-time. At the end of semester, generate your full CA report in one click.",
  },
];

const testimonials = [
  {
    name: "Dr. Adeyemi",
    role: "Lecturer, Mathematics Education",
    text: "I used to spend hours cross-referencing submission emails and WhatsApp messages. Now I just share one link and download the report.",
  },
  {
    name: "Mrs. Okafor",
    role: "HOD, English Education",
    text: "The department-by-department collation is exactly what we needed. Our CA grading used to take days. Now it takes minutes.",
  },
  {
    name: "Prof. Salami",
    role: "Senior Lecturer, Physics Education",
    text: "What I love most is seeing late submissions flagged automatically. I don't have to argue with students about when they submitted.",
  },
];

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#070f0a] text-white overflow-x-hidden font-sans">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#070f0a]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <AssignifyLogo size="md" variant="light" showText={true} />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">How it works</a>
            <a href="#testimonials" className="text-sm text-white/60 hover:text-white transition-colors">Testimonials</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link to="/register" className="text-sm bg-[#0a846b] hover:bg-[#0b9278] text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-[#0a846b]/20">
              Get started free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white/70" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0d1a12] border-t border-white/5 px-6 py-4 space-y-3">
            <a href="#features" className="block text-sm text-white/70 py-2" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm text-white/70 py-2" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#testimonials" className="block text-sm text-white/70 py-2" onClick={() => setMenuOpen(false)}>Testimonials</a>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" className="text-center text-sm text-white/70 border border-white/10 rounded-lg py-2.5">Sign in</Link>
              <Link to="/register" className="text-center text-sm bg-[#0a846b] text-white rounded-lg py-2.5 font-semibold">Get started free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center pt-16 pb-12 px-6 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[#0a846b]/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#1abb9b]/5 rounded-full blur-3xl" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "linear-gradient(#1abb9b 1px, transparent 1px), linear-gradient(90deg, #1abb9b 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
          {/* Diagonal accent line */}
          <div className="absolute top-0 right-[20%] w-px h-full bg-gradient-to-b from-transparent via-[#1abb9b]/10 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-[#0a846b]/15 border border-[#0a846b]/30 text-[#1abb9b] text-xs font-semibold px-4 py-2 rounded-full mb-10 tracking-wide">
            <span className="w-1.5 h-1.5 bg-[#1abb9b] rounded-full animate-pulse" />
            BUILT FOR NIGERIAN UNIVERSITIES
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[76px] font-normal leading-[1.05] mb-6 tracking-tight"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Assignment management
            <br />
            <span className="italic text-[#1abb9b]">that actually works.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create assignments, share one link, collect submissions and generate your CA report —
            without WhatsApp chaos, email threads or manual spreadsheets.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0a846b] hover:bg-[#0c9880] text-white text-base font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-[#0a846b]/25"
            >
              Start for free — no credit card
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center text-white/60 hover:text-white text-sm px-6 py-4 transition-colors">
              Already have an account →
            </Link>
          </div>

          {/* Dashboard mockup */}
          <div className="relative max-w-4xl mx-auto">
            {/* Glow */}
            <div className="absolute -inset-4 bg-[#0a846b]/10 rounded-3xl blur-2xl" />

            <div className="relative bg-[#0d1a12] rounded-2xl border border-white/8 overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0a150e] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]/70" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]/70" />
                  <div className="w-3 h-3 rounded-full bg-[#1abb9b]/70" />
                </div>
                <div className="flex-1 mx-4 bg-white/5 rounded-md h-6 flex items-center px-3">
                  <span className="text-white/25 text-xs">assignify.com.ng/dashboard</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Assignments", value: "14", color: "text-white" },
                    { label: "Total Submissions", value: "312", color: "text-[#1abb9b]" },
                    { label: "Active Now", value: "3", color: "text-white" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/4 rounded-xl p-4 border border-white/5">
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-white/35 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Assignment list */}
                <div className="space-y-2">
                  {[
                    { course: "MAT102", title: "Mid-Semester Assignment", count: 94, level: "100L", open: true },
                    { course: "EST301", title: "Research Paper Submission", count: 47, level: "300L", open: true },
                    { course: "PHY101", title: "Lab Report — Experiment 3", count: 128, level: "100L", open: false },
                    { course: "CHM201", title: "Practical Write-Up", count: 43, level: "200L", open: false },
                  ].map((a) => (
                    <div key={a.title} className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-3 border border-white/4 hover:border-[#1abb9b]/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0a846b]/20 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="h-3.5 w-3.5 text-[#1abb9b]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1abb9b] uppercase tracking-wider">{a.course} · {a.level}</p>
                          <p className="text-sm text-white/80 font-medium">{a.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-white/40">{a.count} submissions</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${a.open ? "bg-[#0a846b]/20 text-[#1abb9b]" : "bg-white/5 text-white/40"}`}>
                          {a.open ? "● Open" : "Closed"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs text-white/50 tracking-widest">SCROLL</span>
          <ChevronDown className="h-4 w-4 animate-bounce text-[#1abb9b]" />
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-[#0a150e] py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: "1 link", label: "to share with your entire class" },
            { value: "0 emails", label: "chasing submissions" },
            { value: "instant", label: "CA Excel report" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-bold text-[#1abb9b]"
                style={{ fontFamily: "'Instrument Serif', serif" }}>
                {s.value}
              </p>
              <p className="text-xs text-white/40 mt-2 tracking-wide uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-[#1abb9b] font-bold tracking-widest uppercase mb-3">FEATURES</p>
            <h2 className="text-4xl md:text-5xl font-normal mb-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}>
              Everything a lecturer needs
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              No complex setup. No training required. Works the way you already think.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={f.title}
                className={`group relative bg-gradient-to-br ${f.color} bg-white/[0.025] border border-white/6 hover:border-[#0a846b]/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5`}
              >
                <div className="w-11 h-11 bg-[#0a846b]/15 group-hover:bg-[#0a846b]/25 rounded-xl flex items-center justify-center mb-5 transition-colors">
                  <f.icon className="h-5 w-5 text-[#1abb9b]" />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6 bg-[#070f0a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-[#1abb9b] font-bold tracking-widest uppercase mb-3">HOW IT WORKS</p>
            <h2 className="text-4xl md:text-5xl font-normal mb-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}>
              Three steps, that's it
            </h2>
            <p className="text-white/50 text-lg">Simpler than sending an email.</p>
          </div>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={s.n} className="group flex gap-6 bg-white/[0.025] hover:bg-white/[0.04] border border-white/6 hover:border-[#0a846b]/30 rounded-2xl p-6 transition-all duration-200">
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-[#0a846b]/15 group-hover:bg-[#0a846b]/25 rounded-xl flex items-center justify-center transition-colors">
                    <s.icon className="h-5 w-5 text-[#1abb9b]" />
                  </div>
                  {i < steps.length - 1 && <div className="w-px flex-1 bg-[#0a846b]/20" />}
                </div>
                <div className="pb-2">
                  <p className="text-[10px] text-[#1abb9b] font-bold tracking-widest mb-1">STEP {s.n}</p>
                  <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-[#1abb9b] font-bold tracking-widest uppercase mb-3">TESTIMONIALS</p>
            <h2 className="text-4xl md:text-5xl font-normal mb-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}>
              What lecturers are saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/[0.025] border border-white/6 rounded-2xl p-6 space-y-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => <Star key={n} className="h-3.5 w-3.5 fill-[#1abb9b] text-[#1abb9b]" />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed italic">"{t.text}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/35 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-[#0a150e]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#0a846b]/8 rounded-3xl blur-2xl" />
            <div className="relative bg-white/[0.025] border border-[#0a846b]/25 rounded-3xl p-12 md:p-16 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1abb9b]/30 to-transparent" />

              <div className="flex justify-center mb-6">
                <AssignifyLogo size="lg" variant="light" showText={true} />
              </div>

              <h2 className="text-4xl md:text-5xl font-normal mb-4"
                style={{ fontFamily: "'Instrument Serif', serif" }}>
                Ready to simplify your semester?
              </h2>
              <p className="text-white/55 text-lg mb-8 max-w-lg mx-auto">
                Free for all lecturers. No credit card. No setup fees. Takes less than 2 minutes to get started.
              </p>

              <Link to="/register"
                className="group inline-flex items-center gap-2 bg-[#0a846b] hover:bg-[#0c9880] text-white text-base font-semibold px-10 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-[#0a846b]/25"
              >
                Create your free account
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6 bg-[#070f0a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <AssignifyLogo size="sm" variant="light" showText={true} />
          <p className="text-xs text-white/25 text-center">
            Built by{" "}
            <a href="https://www.linkedin.com/in/praise-ogooluwa" target="_blank" rel="noopener noreferrer"
              className="text-[#1abb9b] hover:underline">
              Isaiah Ogooluwa Bakare
            </a>{" "}
            · © 2026 Assignify
          </p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <a href="mailto:support@assignify.com.ng" className="hover:text-white/60 transition-colors">
              support@assignify.com.ng
            </a>
            <Link to="/login" className="hover:text-white/60 transition-colors">Lecturer Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;