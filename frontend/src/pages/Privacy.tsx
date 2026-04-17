import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AssignifyLogo from "@/components/AssignifyLogo";

const Privacy = () => {
  const updated = "16 April 2026";

  return (
    <div className="min-h-screen bg-[#070f0a] text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#070f0a]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <AssignifyLogo size="sm" variant="light" showText={true} />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs text-[#1abb9b] font-bold tracking-widest uppercase mb-3">LEGAL</p>
          <h1 className="text-4xl md:text-5xl font-normal mb-4 text-white"
            style={{ fontFamily: "'Instrument Serif', serif" }}>
            Privacy Policy
          </h1>
          <p className="text-white/40 text-sm">Last updated: {updated}</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-10 text-white/70 text-sm leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-white text-lg font-semibold">1. Who we are</h2>
            <p>
              Assignify ("we", "us", "our") is an assignment management platform built for Nigerian universities.
              It is operated by Isaiah Ogooluwa Bakare. You can contact us at{" "}
              <a href="mailto:support@assignify.com.ng" className="text-[#1abb9b] hover:underline">support@assignify.com.ng</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white text-lg font-semibold">2. What data we collect</h2>
            <p>We collect the following categories of data:</p>
            <div className="space-y-3 pl-4 border-l border-white/10">
              <div>
                <p className="text-white font-medium mb-1">Lecturer account data</p>
                <p>Full name, email address, and password (stored encrypted via Supabase Auth). Collected when you register.</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Assignment data</p>
                <p>Course name, assignment title, deadline, instructions, and level — entered by you when you create assignments.</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Student submission data</p>
                <p>Student full name, matric number, department, and uploaded file (PDF or Word document). Collected when a student submits through your assignment link.</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Usage data</p>
                <p>We may collect anonymous usage metrics (page views, feature usage) to improve the product. No personally identifiable information is included in this data.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-white text-lg font-semibold">3. How we use your data</h2>
            <p>We use collected data solely to:</p>
            <ul className="space-y-1.5 pl-5 list-disc list-outside">
              <li>Provide and operate the Assignify service</li>
              <li>Allow lecturers to view, manage, and download submissions</li>
              <li>Generate CA collation reports</li>
              <li>Send transactional emails (e.g. OTP verification, password reset)</li>
              <li>Improve and debug the platform</li>
            </ul>
            <p>We do <strong className="text-white">not</strong> sell your data or any student data to third parties. We do not use your data for advertising.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white text-lg font-semibold">4. Student data and your responsibility</h2>
            <p>
              As a lecturer using Assignify, you are responsible for ensuring that collecting student data through the platform is appropriate under your institution's policies and applicable Nigerian data protection law (NDPR 2019).
            </p>
            <p>
              You should inform students that their name, matric number, department, and submitted files are being collected through this platform. We recommend including this information when sharing the submission link.
            </p>
            <p>
              Assignify stores student submission files securely in encrypted cloud storage. Access to these files is restricted to the lecturer who owns the assignment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white text-lg font-semibold">5. Data storage and security</h2>
            <p>
              All data is stored on Supabase infrastructure (hosted on AWS). Data is encrypted at rest and in transit using industry-standard TLS/SSL. Supabase complies with SOC 2 Type II standards.
            </p>
            <p>
              Passwords are never stored in plain text. They are hashed using bcrypt via Supabase Auth.
            </p>
            <p>
              While we take reasonable precautions to protect your data, no system is 100% secure. If you become aware of any security issue, please contact us immediately at{" "}
              <a href="mailto:support@assignify.com.ng" className="text-[#1abb9b] hover:underline">support@assignify.com.ng</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white text-lg font-semibold">6. Data retention</h2>
            <p>
              Lecturer accounts and their associated assignments and submissions are retained as long as the account is active. If you delete your account, your data and all associated student submissions will be permanently deleted within 30 days.
            </p>
            <p>
              You may request deletion of your account and all associated data at any time by emailing{" "}
              <a href="mailto:support@assignify.com.ng" className="text-[#1abb9b] hover:underline">support@assignify.com.ng</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white text-lg font-semibold">7. Third-party services</h2>
            <p>We use the following third-party services to operate Assignify:</p>
            <ul className="space-y-1.5 pl-5 list-disc list-outside">
              <li><strong className="text-white">Supabase</strong> — database, authentication, and file storage</li>
              <li><strong className="text-white">Vercel</strong> — frontend hosting</li>
              <li><strong className="text-white">Render</strong> — backend API hosting</li>
              <li><strong className="text-white">Resend</strong> — transactional email delivery</li>
            </ul>
            <p>Each of these providers has their own privacy policy and complies with applicable data protection regulations.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white text-lg font-semibold">8. Cookies</h2>
            <p>
              Assignify does not use tracking cookies or advertising cookies. We may use essential session cookies required for authentication. These are necessary for the service to function and cannot be disabled.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white text-lg font-semibold">9. Your rights</h2>
            <p>Under the Nigeria Data Protection Regulation (NDPR) 2019, you have the right to:</p>
            <ul className="space-y-1.5 pl-5 list-disc list-outside">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to the processing of your data</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:support@assignify.com.ng" className="text-[#1abb9b] hover:underline">support@assignify.com.ng</a>.
              We will respond within 14 business days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white text-lg font-semibold">10. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of Assignify after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white text-lg font-semibold">11. Contact</h2>
            <p>
              For any privacy-related questions or requests, contact us at:{" "}
              <a href="mailto:support@assignify.com.ng" className="text-[#1abb9b] hover:underline">support@assignify.com.ng</a>
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>© 2026 Assignify</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
            <Link to="/" className="hover:text-white/60 transition-colors">Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;