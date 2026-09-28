"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import {
  Play,
  Download,
  FileArchive,
  ScanSearch,
  Sparkles,
  Loader2,
  ZoomIn,
  ZoomOut,
  WrapText,
  type LucideIcon,
} from "lucide-react";
import { api, Project, Version, JobDescription, ATSResult, TailorResult, ApiError } from "@/lib/api";
import { LatexEditor } from "@/components/LatexEditor";
import VersionDrawer from "@/components/VersionDrawer";
import ATSPanel from "@/components/ATSPanel";
import TailorReviewModal from "@/components/TailorReviewModal";
import { toast } from "@/lib/toastStore";

const TAILOR_STEPS = [
  "Analyzing job description…",
  "Analyzing resume…",
  "Matching requirements…",
  "Optimizing resume…",
  "Validating changes…",
  "Compiling PDF…",
  "Running ATS checks…",
];

type RightTab = "ats" | "jd";

export default function EditorPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [active, setActive] = useState<Version | null>(null);
  const [latex, setLatex] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [compileErrors, setCompileErrors] = useState<string[]>([]);
  const [compiling, setCompiling] = useState(false);

  const [jds, setJds] = useState<JobDescription[]>([]);
  const [selectedJdId, setSelectedJdId] = useState<string>("");

  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [tailoring, setTailoring] = useState(false);
  const [tailorStep, setTailorStep] = useState(0);
  const [tailorResult, setTailorResult] = useState<TailorResult | null>(null);
  const [applyingTailor, setApplyingTailor] = useState(false);

  const [rightTab, setRightTab] = useState<RightTab>("ats");
  const [fontSize, setFontSize] = useState(13);
  const [wordWrap, setWordWrap] = useState(true);

  // Blob URLs render PDFs far more reliably than data: URLs in an iframe.
  const pdfUrl = useMemo(() => {
    if (!pdfBase64) return null;
    const bytes = atob(pdfBase64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return URL.createObjectURL(new Blob([arr], { type: "application/pdf" }));
  }, [pdfBase64]);
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadAll() {
    try {
      const [proj, vs, jdList] = await Promise.all([
        api.getProject(projectId),
        api.listVersions(projectId),
        api.listJDs(),
      ]);
      setProject(proj);
      setVersions(vs);
      setJds(jdList);
      const latest = vs.slice().sort((a, b) => b.version_number - a.version_number)[0];
      if (latest) {
        setActive(latest);
        setLatex(latest.latex_source);
        if (latest.job_description_id) setSelectedJdId(latest.job_description_id);
      }
    } catch {
      toast("Could not load this resume project.", "error");
    }
  }

  async function refreshVersions() {
    const vs = await api.listVersions(projectId);
    setVersions(vs);
    return vs;
  }

  function onEditorChange(v: string) {
    setLatex(v);
    setSaveStatus("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => autosave(v), 1200);
  }

  async function autosave(value: string) {
    if (!active) return;
    setSaveStatus("saving");
    try {
      await api.updateVersion(active.id, { latex_source: value });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("unsaved");
      toast("Autosave failed — your edits are still in the editor.", "error");
    }
  }

  async function handleCompile() {
    setCompiling(true);
    setCompileErrors([]);
    try {
      const result = await api.compile(latex);
      if (result.success && result.pdf_base64) {
        setPdfBase64(result.pdf_base64);
        toast("Compiled successfully.", "success");
      } else {
        setPdfBase64(null);
        setCompileErrors(result.errors.length ? result.errors : ["Compilation failed. See log for details."]);
        toast("Compilation failed.", "error");
      }
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Compilation request failed.", "error");
    } finally {
      setCompiling(false);
    }
  }

  async function handleAnalyze() {
    if (!selectedJdId) {
      toast("Select a job description first.", "info");
      return;
    }
    setAnalyzing(true);
    setRightTab("ats");
    try {
      const result = await api.analyze(latex, selectedJdId);
      setAtsResult(result);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "ATS analysis failed.", "error");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleTailor() {
    if (!selectedJdId) {
      toast("Select a job description first.", "info");
      return;
    }
    setTailoring(true);
    setTailorStep(0);
    stepTimer.current = setInterval(() => {
      setTailorStep((s) => Math.min(s + 1, TAILOR_STEPS.length - 1));
    }, 900);
    try {
      const result = await api.tailor({
        latex_source: latex,
        job_description_id: selectedJdId,
        project_id: projectId,
      });
      setTailorResult(result);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "AI tailoring failed. Your original resume was not changed.", "error");
    } finally {
      if (stepTimer.current) clearInterval(stepTimer.current);
      setTailoring(false);
    }
  }

  async function applyTailorAsNewVersion() {
    if (!tailorResult) return;
    setApplyingTailor(true);
    try {
      const jd = jds.find((j) => j.id === selectedJdId);
      const name = jd?.structured_data?.job_title
        ? `Tailored for ${jd.structured_data.job_title}`
        : "Tailored version";
      const newVersion = await api.createVersion(projectId, {
        name,
        latex_source: tailorResult.updated_latex,
        job_description_id: selectedJdId,
      });
      await refreshVersions();
      setActive(newVersion);
      setLatex(newVersion.latex_source);
      setTailorResult(null);
      toast("New version created from AI tailoring.", "success");
    } catch {
      toast("Could not save the tailored version.", "error");
    } finally {
      setApplyingTailor(false);
    }
  }

  async function openVersion(v: Version) {
    setActive(v);
    setLatex(v.latex_source);
    setPdfBase64(null);
    setCompileErrors([]);
    setAtsResult(null);
    setSaveStatus("saved");
    if (v.job_description_id) setSelectedJdId(v.job_description_id);
  }

  async function renameVersion(v: Version, name: string) {
    if (!name.trim()) return;
    try {
      await api.updateVersion(v.id, { name });
      await refreshVersions();
      toast("Version renamed.", "success");
    } catch {
      toast("Could not rename version.", "error");
    }
  }

  async function duplicateVersion(v: Version) {
    try {
      const dup = await api.duplicateVersion(v.id);
      await refreshVersions();
      toast(`Duplicated as ${dup.name}.`, "success");
    } catch {
      toast("Could not duplicate version.", "error");
    }
  }

  async function deleteVersion(v: Version) {
    try {
      await api.deleteVersion(v.id);
      const vs = await refreshVersions();
      if (active?.id === v.id) {
        const next = vs.slice().sort((a, b) => b.version_number - a.version_number)[0];
        if (next) openVersion(next);
        else {
          setActive(null);
          setLatex("");
        }
      }
      toast("Version deleted.", "success");
    } catch {
      toast("Could not delete version.", "error");
    }
  }

  function downloadTex(v: Version) {
    const blob = new Blob([v.latex_source], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${slug(v.name)}.tex`);
  }

  function downloadPdf() {
    if (!pdfBase64) {
      toast("Compile the resume first to generate a PDF.", "info");
      return;
    }
    const bytes = atob(pdfBase64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    saveAs(new Blob([arr], { type: "application/pdf" }), `${slug(active?.name || "resume")}.pdf`);
  }

  async function downloadZip() {
    const zip = new JSZip();
    zip.file("resume.tex", latex);
    zip.file(
      "README.txt",
      `ResumeForge AI export\nProject: ${project?.name}\nVersion: ${active?.name}\nGenerated: ${new Date().toISOString()}\n`
    );
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${slug(project?.name || "resume-project")}.zip`);
  }

  function slug(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "resume";
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div className="flex h-screen">
      <VersionDrawer
        versions={versions}
        activeId={active?.id || null}
        onOpen={openVersion}
        onRename={renameVersion}
        onDuplicate={duplicateVersion}
        onDelete={deleteVersion}
        onDownloadTex={downloadTex}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.push("/resumes")} className="text-[12px] text-neutral-500 hover:text-neutral-200">
              ← Resumes
            </button>
            <span className="text-[13px] font-medium truncate">{project?.name}</span>
            <SaveStatusBadge status={saveStatus} />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={selectedJdId}
              onChange={(e) => setSelectedJdId(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-md text-[12px] px-2 py-1.5 max-w-[180px]"
            >
              <option value="">Select JD…</option>
              {jds.map((jd) => (
                <option key={jd.id} value={jd.id}>
                  {jd.structured_data?.job_title || jd.filename || jd.id.slice(0, 8)}
                </option>
              ))}
            </select>

            <ToolbarButton icon={ScanSearch} label="ATS Analyze" onClick={handleAnalyze} loading={analyzing} />
            <ToolbarButton icon={Sparkles} label="Tailor Resume" onClick={handleTailor} loading={tailoring} accent />
            <ToolbarButton icon={Play} label="Compile" onClick={handleCompile} loading={compiling} accent />

            <div className="w-px h-5 bg-neutral-800 mx-1" />
            <ToolbarButton icon={Download} label="PDF" onClick={downloadPdf} />
            <ToolbarButton icon={FileArchive} label="ZIP" onClick={downloadZip} />
          </div>
        </div>

        {/* Editor + Preview */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0 border-r border-neutral-800">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-900 text-[11px] text-neutral-500">
              <span>LaTeX Editor</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setFontSize((f) => Math.max(10, f - 1))}>
                  <ZoomOut size={13} />
                </button>
                <span>{fontSize}px</span>
                <button onClick={() => setFontSize((f) => Math.min(20, f + 1))}>
                  <ZoomIn size={13} />
                </button>
                <button
                  onClick={() => setWordWrap((w) => !w)}
                  className={wordWrap ? "text-emerald-400" : ""}
                  title="Toggle word wrap"
                >
                  <WrapText size={13} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <LatexEditor value={latex} onChange={onEditorChange} fontSize={fontSize} wordWrap={wordWrap} />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 border-r border-neutral-800">
            <div className="px-3 py-1.5 border-b border-neutral-900 text-[11px] text-neutral-500">
              PDF Preview
            </div>
            <div className="flex-1 bg-neutral-900 overflow-auto">
              {pdfUrl ? (
                <iframe
                  title="pdf-preview"
                  src={pdfUrl}
                  className="w-full h-full"
                />
              ) : compileErrors.length > 0 ? (
                <div className="p-4">
                  <p className="text-[13px] text-red-400 font-medium mb-2">Compilation failed</p>
                  <ul className="space-y-1 text-[12px] text-red-300 mb-3">
                    {compileErrors.slice(0, 8).map((e, i) => (
                      <li key={i} className="font-mono">
                        {e}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-neutral-500">
                    Your source code has not been lost — fix the LaTeX and compile again.
                  </p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-600 text-[13px]">
                  Click Compile to see a live PDF preview.
                </div>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="w-80 shrink-0 flex flex-col">
            <div className="flex border-b border-neutral-900">
              <PanelTab active={rightTab === "ats"} onClick={() => setRightTab("ats")} label="ATS / AI" />
              <PanelTab active={rightTab === "jd"} onClick={() => setRightTab("jd")} label="JD" />
            </div>
            <div className="flex-1 overflow-auto p-4">
              {rightTab === "ats" ? (
                atsResult ? (
                  <ATSPanel result={atsResult} />
                ) : (
                  <p className="text-[12px] text-neutral-500">
                    Select a job description and click <span className="text-neutral-300">ATS Analyze</span> to see your compatibility score.
                  </p>
                )
              ) : (
                <JDSummary jd={jds.find((j) => j.id === selectedJdId)} />
              )}
            </div>
          </div>
        </div>
      </div>

      {tailoring && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-6 py-5 w-80">
            <Loader2 className="animate-spin text-emerald-400 mb-3" size={20} />
            <p className="text-[13px] text-neutral-200">{TAILOR_STEPS[tailorStep]}</p>
            <div className="mt-3 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${((tailorStep + 1) / TAILOR_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {tailorResult && (
        <TailorReviewModal
          original={latex}
          result={tailorResult}
          applying={applyingTailor}
          onApply={applyTailorAsNewVersion}
          onKeepOriginal={() => setTailorResult(null)}
          onCancel={() => setTailorResult(null)}
        />
      )}
    </div>
  );
}

function SaveStatusBadge({ status }: { status: "saved" | "saving" | "unsaved" }) {
  const label = status === "saved" ? "Saved" : status === "saving" ? "Saving…" : "Unsaved changes";
  const color = status === "saved" ? "text-emerald-500" : status === "saving" ? "text-neutral-400" : "text-amber-400";
  return <span className={`text-[11px] ${color}`}>● {label}</span>;
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  loading,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  loading?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] disabled:opacity-50 ${
        accent
          ? "bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-medium"
          : "border border-neutral-800 text-neutral-300 hover:bg-neutral-900"
      }`}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
      {label}
    </button>
  );
}

function PanelTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-[12px] py-2 border-b-2 ${
        active ? "border-emerald-400 text-neutral-100" : "border-transparent text-neutral-500 hover:text-neutral-300"
      }`}
    >
      {label}
    </button>
  );
}

function JDSummary({ jd }: { jd?: JobDescription }) {
  if (!jd) return <p className="text-[12px] text-neutral-500">Select a job description from the dropdown above.</p>;
  const sd = jd.structured_data || {};
  return (
    <div className="space-y-3 text-[13px]">
      <div>
        <h3 className="text-[12px] font-medium text-neutral-400">Job Title</h3>
        <p>{sd.job_title || "—"}</p>
      </div>
      <div>
        <h3 className="text-[12px] font-medium text-neutral-400">Company</h3>
        <p>{sd.company || "—"}</p>
      </div>
      {sd.required_skills && sd.required_skills.length > 0 && (
        <div>
          <h3 className="text-[12px] font-medium text-neutral-400 mb-1">Required Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {sd.required_skills.map((s: string) => (
              <span key={s} className="text-[11px] bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      {sd.responsibilities && sd.responsibilities.length > 0 && (
        <div>
          <h3 className="text-[12px] font-medium text-neutral-400 mb-1">Responsibilities</h3>
          <ul className="list-disc list-inside text-[12px] text-neutral-400 space-y-0.5">
            {sd.responsibilities.slice(0, 6).map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
