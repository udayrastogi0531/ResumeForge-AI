"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileStack, FileText, Mail, ScanSearch, Plus, Upload, type LucideIcon } from "lucide-react";
import { api, Project, JobDescription, CoverLetter, Version } from "@/lib/api";
import { Skeleton } from "@/components/Primitives";
import { toast } from "@/lib/toastStore";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [jds, setJds] = useState<JobDescription[] | null>(null);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[] | null>(null);
  const [versionCounts, setVersionCounts] = useState<number>(0);
  const [avgAts, setAvgAts] = useState<number | null>(null);

  async function load() {
    try {
      const [p, j, c] = await Promise.all([
        api.listProjects(),
        api.listJDs(),
        api.listCoverLetters(),
      ]);
      setProjects(p);
      setJds(j);
      setCoverLetters(c);

      const allVersions: Version[] = [];
      for (const proj of p) {
        try {
          const versions = await api.listVersions(proj.id);
          allVersions.push(...versions);
        } catch {}
      }
      setVersionCounts(allVersions.length);
      const scored = allVersions.filter((v) => v.ats_score != null);
      if (scored.length > 0) {
        setAvgAts(
          Math.round((scored.reduce((sum, v) => sum + (v.ats_score || 0), 0) / scored.length) * 10) / 10
        );
      }
    } catch {
      toast("Could not load dashboard data.", "error");
    }
  }

  async function createResume() {
    try {
      const project = await api.createProject("Untitled Resume");
      router.push(`/resumes/${project.id}/editor`);
    } catch {
      toast("Could not create a new resume.", "error");
    }
  }

  const loading = projects === null || jds === null || coverLetters === null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <h1 className="text-lg font-medium mb-1">Dashboard</h1>
      <p className="text-[13px] text-neutral-500 mb-8">
        Welcome back. Here&apos;s what&apos;s happening across your resumes.
      </p>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <QuickAction icon={Plus} label="New Resume" onClick={createResume} />
        <QuickAction icon={Upload} label="Upload JD" onClick={() => router.push("/jd")} />
        <QuickAction icon={FileStack} label="Resume Studio" onClick={() => router.push("/resumes")} />
        <QuickAction icon={Mail} label="Cover Letter" onClick={() => router.push("/cover-letters")} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatCard icon={FileStack} label="Resume Projects" value={loading ? null : projects!.length} />
        <StatCard icon={FileText} label="Resume Versions" value={loading ? null : versionCounts} />
        <StatCard icon={ScanSearch} label="JDs Analyzed" value={loading ? null : jds!.length} />
        <StatCard icon={Mail} label="Cover Letters" value={loading ? null : coverLetters!.length} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <RecentPanel
          title="Recent Resumes"
          loading={loading}
          items={projects?.slice(0, 5).map((p) => ({
            key: p.id,
            primary: p.name,
            secondary: `${p.version_count} version${p.version_count === 1 ? "" : "s"}`,
            href: `/resumes/${p.id}/editor`,
          }))}
          emptyTitle="No resumes yet."
          emptyAction={
            <button onClick={createResume} className="text-[13px] text-emerald-400 hover:underline">
              Create your first resume
            </button>
          }
        />
        <RecentPanel
          title="Recent Job Descriptions"
          loading={loading}
          items={jds?.slice(0, 5).map((jd) => ({
            key: jd.id,
            primary: jd.structured_data?.job_title || jd.filename || "Job description",
            secondary: jd.structured_data?.company || "",
            href: `/jd`,
          }))}
          emptyTitle="No job descriptions."
          emptyAction={
            <Link href="/jd" className="text-[13px] text-emerald-400 hover:underline">
              Upload a JD to start tailoring your resume
            </Link>
          }
        />
        <RecentPanel
          title="Recent Cover Letters"
          loading={loading}
          items={coverLetters?.slice(0, 5).map((cl) => ({
            key: cl.id,
            primary: cl.title,
            secondary: cl.tone,
            href: `/cover-letters/${cl.id}`,
          }))}
          emptyTitle="No cover letters."
          emptyAction={
            <Link href="/jd" className="text-[13px] text-emerald-400 hover:underline">
              Generate a cover letter from a job description
            </Link>
          }
        />
      </div>

      {avgAts != null && (
        <p className="text-[12px] text-neutral-600 mt-8">
          Average ATS Compatibility Score across scored versions: {avgAts}/100
        </p>
      )}
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 border border-neutral-800 rounded-lg px-4 py-3 text-[13px] hover:bg-neutral-900 transition-colors text-left"
    >
      <Icon size={16} className="text-emerald-400" strokeWidth={1.75} />
      {label}
    </button>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | null }) {
  return (
    <div className="border border-neutral-800 rounded-lg p-4">
      <div className="flex items-center gap-2 text-neutral-500 mb-2">
        <Icon size={14} strokeWidth={1.75} />
        <span className="text-[12px]">{label}</span>
      </div>
      {value === null ? (
        <Skeleton className="h-6 w-10" />
      ) : (
        <span className="text-xl font-semibold">{value}</span>
      )}
    </div>
  );
}

function RecentPanel({
  title,
  loading,
  items,
  emptyTitle,
  emptyAction,
}: {
  title: string;
  loading: boolean;
  items?: { key: string; primary: string; secondary?: string; href: string }[];
  emptyTitle: string;
  emptyAction: React.ReactNode;
}) {
  return (
    <div className="border border-neutral-800 rounded-lg p-4">
      <h2 className="text-[13px] font-medium mb-3">{title}</h2>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : items && items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="flex flex-col px-2 py-1.5 rounded-md hover:bg-neutral-900 transition-colors"
              >
                <span className="text-[13px] text-neutral-200 truncate">{item.primary}</span>
                {item.secondary && (
                  <span className="text-[11px] text-neutral-500 truncate">{item.secondary}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-3">
          <p className="text-[13px] text-neutral-500 mb-1.5">{emptyTitle}</p>
          {emptyAction}
        </div>
      )}
    </div>
  );
}
