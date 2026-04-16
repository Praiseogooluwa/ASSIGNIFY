import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AssignifyLogo from "@/components/AssignifyLogo";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.error("404 Error:", location.pathname);
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "hsl(210 20% 98%)" }}
    >
      {/* Background dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(hsl(168 85% 28% / 0.05) 1px, transparent 1px),
            linear-gradient(90deg, hsl(168 85% 28% / 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background: "radial-gradient(circle, hsl(168 85% 28% / 0.08) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Logo */}
      <div
        className="absolute top-6 left-8 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-8px)" }}
      >
        <AssignifyLogo size="md" variant="dark" showText />
      </div>

      {/* Main */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
      >
        {/* Giant 404 */}
        <div className="relative mb-2 select-none" aria-hidden="true">
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(120px, 22vw, 220px)",
              fontStyle: "italic",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "hsl(168 85% 28% / 0.12)",
              display: "block",
            }}
          >
            404
          </span>
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(120px, 22vw, 220px)",
              fontStyle: "italic",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "hsl(168 85% 28%)",
              display: "block",
              position: "absolute",
              inset: 0,
              clipPath: "inset(0 0 55% 0)",
            }}
          >
            404
          </span>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6 w-full max-w-xs">
          <div style={{ flex: 1, height: "1px", background: "hsl(168 85% 28% / 0.2)" }} />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(168 85% 28%)" strokeWidth="1.8">
            <path d="M9 12h6M12 9v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          <div style={{ flex: 1, height: "1px", background: "hsl(168 85% 28% / 0.2)" }} />
        </div>

        <h1
          style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(22px, 4vw, 32px)", fontStyle: "italic" }}
          className="text-foreground mb-2 leading-tight"
        >
          This page doesn't exist
        </h1>

        <p className="text-muted-foreground text-sm mb-8 max-w-sm leading-relaxed">
          The link may be broken, or the assignment may have been removed.
          Check the URL or head back to your dashboard.
        </p>

        {location.pathname !== "/" && (
          <div
            className="mb-8 px-4 py-1.5 rounded-full text-xs font-mono text-muted-foreground"
            style={{ background: "hsl(210 15% 93%)", border: "1px solid hsl(210 15% 88%)" }}
          >
            {location.pathname}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-95"
            style={{ background: "hsl(168 85% 28%)", boxShadow: "0 1px 3px hsl(168 85% 28% / 0.4)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(168 85% 22%)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(168 85% 28%)")}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-95"
            style={{ background: "transparent", border: "1px solid hsl(210 15% 88%)", color: "hsl(215 25% 12%)" }}
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Footer */}
      <div
        className="absolute bottom-6 transition-opacity duration-700"
        style={{
          opacity: visible ? 0.45 : 0,
          transitionDelay: "400ms",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "11px",
          color: "hsl(215 12% 48%)",
          letterSpacing: "0.08em",
        }}
      >
        ASSIGNIFY · SMART ASSIGNMENT MANAGEMENT
      </div>
    </div>
  );
};

export default NotFound;