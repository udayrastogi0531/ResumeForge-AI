import Link from "next/link";
import { FileCode2, ScanSearch, Sparkles, Mail, GitBranch, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: FileCode2, title: "LaTeX Resume Studio", desc: "A split-screen editor with live PDF compilation, built for resumes." },
  { icon: Sparkles, title: "AI Resume Tailoring", desc: "Rewrites and reorders what you already have — never invents new experience." },
  { icon: ScanSearch, title: "ATS Analysis", desc: "A deterministic compatibility score, not a black-box AI guess." },
  { icon: GitBranch, title: "JD Matching", desc: "Upload a job description PDF and see exactly what's covered and what's missing." },
  { icon: Mail, title: "Cover Letter Generator", desc: "Truthful, JD-specific cover letters generated from your real resume." },
  { icon: ShieldCheck, title: "Version Control", desc: "Every tailor pass creates a new version. Nothing is overwritten silently." },
];

const STEPS = ["Upload JD", "Analyze", "Tailor", "Review", "Export"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="font-semibold tracking-tight">
          ResumeForge <span className="text-emerald-400">AI</span>
        </span>
        <div className="flex items-center gap-3 text-[13px]">
          <Link href="/login" className="text-neutral-400 hover:text-neutral-100">
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-medium px-3 py-1.5 rounded-md"
          >
            Start Building
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
          Build a resume that speaks the language of the job.
        </h1>
        <p className="mt-5 text-neutral-400 text-[15px] leading-relaxed">
          Edit your resume in LaTeX, analyze any job description, optimize your resume
          for ATS compatibility, and generate tailored cover letters — without
          inventing experience.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-medium text-[13px] px-5 py-2.5 rounded-md"
          >
            Start Building
          </Link>
          <Link
            href="/login"
            className="border border-neutral-800 hover:border-neutral-700 text-[13px] px-5 py-2.5 rounded-md text-neutral-300"
          >
            Try Demo
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[13px] text-neutral-400">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <span className="border border-neutral-800 rounded-full px-3 py-1">
                {i + 1}. {s}
              </span>
              {i < STEPS.length - 1 && <span className="text-neutral-700">→</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="border border-neutral-800 rounded-lg p-5 bg-neutral-900/40">
              <Icon size={18} className="text-emerald-400 mb-3" strokeWidth={1.75} />
              <h3 className="text-[14px] font-medium mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-neutral-500 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-[12px] text-neutral-600 border-t border-neutral-900">
        ResumeForge AI — your data, your resume, your control.
      </footer>
    </div>
  );
}
