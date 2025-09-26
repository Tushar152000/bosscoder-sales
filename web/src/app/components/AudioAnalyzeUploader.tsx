"use client";
import React, { useCallback, useMemo, useRef, useState } from "react";

type SectionName =
  | "greeting"
  | "opening"
  | "discovery"
  | "pitch"
  | "pricing"
  | "closing";
type Section = {
  name: SectionName;
  t0: number;
  t1: number;
  confidence?: number;
  triggers?: string[];
};
type KPIs = {
  totalSec: number;
  percentTime: Record<SectionName, number>;
  timeToPricingSec: number | null;
};
type Score = { total: number; detail: Record<string, number> };

type Rules = {
  minDurationSec?: number;
  requireKeywords?: string[];
  forbiddenKeywords?: string[];
  minWords?: number;
};
type AnalyzeStats = { durationSec?: number; wordCount?: number };

type AnalyzeResponse =
  | {
      ok: true;
      transcript: string;
      passes: boolean;
      failures: string[];
      stats: AnalyzeStats;
      sections?: Section[];
      kpis?: KPIs;
      score?: Score;
      fileName?: string;
    }
  | { ok: false; error: string };

/* =========================
   Config & helpers
   ========================= */
const DEFAULT_RULES: Rules = {
  minDurationSec: 15,
  requireKeywords: [],
  forbiddenKeywords: [],
  minWords: 20
};
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

const formatSecs = (n?: number) => (typeof n === "number" ? n.toFixed(1) : "—");
const formatMMSS = (sec?: number | null) => {
  if (sec == null || isNaN(sec)) return "—";
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
};
const formatBytes = (b: number) =>
  b < 1024
    ? `${b} B`
    : b < 1024 * 1024
    ? `${(b / 1024).toFixed(1)} KB`
    : `${(b / (1024 * 1024)).toFixed(1)} MB`;

const SECTION_COLORS: Record<SectionName, string> = {
  greeting: "#E5E7EB",
  opening: "#C7D2FE",
  discovery: "#BBF7D0",
  pitch: "#FDE68A",
  pricing: "#FCA5A5",
  closing: "#A7F3D0"
};

function StatusBadge({ text, good }: { text: string; good?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        good
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
          : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          good ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      {text}
    </span>
  );
}

function SectionTimeline({ secs }: { secs: Section[] }) {
  const withDur = useMemo(
    () => secs.map((s) => ({ ...s, dur: s.t1 - s.t0 })),
    [secs]
  );
  const total = useMemo(
    () => withDur.reduce((a, b) => a + b.dur, 0) || 1,
    [withDur]
  );

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-slate-900">Call Timeline</div>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
          {(Object.keys(SECTION_COLORS) as SectionName[]).map((n) => (
            <span
              key={n}
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 ring-1 ring-slate-200 bg-white"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: SECTION_COLORS[n] }}
              />
              {n}
            </span>
          ))}
        </div>
      </div>
      <div className="h-3 w-full overflow-hidden rounded bg-slate-100 ring-1 ring-inset ring-slate-200">
        <div className="flex h-full">
          {withDur.map((s, i) => (
            <div
              key={i}
              title={`${s.name} (${s.dur.toFixed(1)}s)`}
              style={{
                width: `${(s.dur / total) * 100}%`,
                background: SECTION_COLORS[s.name]
              }}
              className="h-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function KPIBlock({
  label,
  value,
  sub
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

function ProgressBar({
  value,
  indeterminate
}: {
  value: number;
  indeterminate?: boolean;
}) {
  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded bg-slate-100">
      <div
        className={`h-full transition-all ${
          indeterminate ? "animate-pulse bg-indigo-300" : "bg-indigo-500"
        }`}
        style={{
          width: indeterminate ? "40%" : `${Math.max(0, Math.min(100, value))}%`
        }}
      />
    </div>
  );
}
export default function AudioAnalyzeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [hint, setHint] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = useState<number>(0); // 0..100
  const [phase, setPhase] = useState<
    "idle" | "uploading" | "processing" | "done" | "error"
  >("idle");

  const validate = (f: File | null): string => {
    if (!f) return "Please select an MP3 file.";
    const isMp3 =
      f.type === "audio/mpeg" ||
      f.type === "audio/mp3" ||
      /\.mp3$/i.test(f.name);
    if (!isMp3) return "Only .mp3 files are supported.";
    if (f.size > MAX_SIZE_BYTES) return "Max file size is 50 MB.";
    return "";
  };

  const assignFile = (f: File | null) => {
    const e = validate(f);
    setError(e);
    setHint(e ? "" : "Ready to analyze.");
    setFile(e ? null : f);
    setResult(null);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    assignFile(e.target.files?.[0] ?? null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    assignFile(e.dataTransfer.files?.[0] ?? null);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setHint("Drop to upload");
  };
  const onDragLeave = () => setHint(file ? "Ready to analyze." : "");
  const pickFile = () => inputRef.current?.click();

  const analyze = async () => {
    if (!file) {
      setError("Please select an MP3 file first.");
      return;
    }
    setLoading(true);
    setError("");
    setHint("");
    setResult(null);
    setPhase("uploading");
    setProgress(0);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("rules", JSON.stringify(DEFAULT_RULES));

      // Use XHR to get upload progress
      const xhr = new XMLHttpRequest();
      const url = "/api/analyze-audio";

      // When uploading…
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
        }
      };

      // After upload finished but before server responds, show “processing”
      xhr.upload.onload = () => {
        setPhase("processing");
        // Smooth “indeterminate-like” progress while we wait
        let p = 60; // start around 60% to feel responsive
        setProgress(p);
        const tick = setInterval(() => {
          p = Math.min(95, p + 1 + Math.random() * 2); // creep to 95%
          setProgress(Math.round(p));
        }, 300);
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            clearInterval(tick);
          }
        };
      };

      xhr.onerror = () => {
        setPhase("error");
        setHint("");
        setError("Network error while uploading/processing the file.");
        setLoading(false);
      };

      xhr.onload = () => {
        try {
          if (xhr.status < 200 || xhr.status >= 300) {
            setPhase("error");
            setHint("");
            setError(`Server error ${xhr.status}: ${xhr.responseText}`);
            setLoading(false);
            return;
          }
          const json = JSON.parse(xhr.responseText) as AnalyzeResponse;
          if (!json.ok) {
            setPhase("error");
            setHint("");
            setError(json.error || "Analysis failed");
            setLoading(false);
            return;
          }
          setResult(json);
          setPhase("done");
          setProgress(100);
          setHint(
            json.passes ? "Analysis passed." : "Analysis completed (failed)."
          );
        } catch (e) {
          setPhase("error");
          setHint("");
          setError(
            e instanceof Error ? e.message : "Failed to parse server response."
          );
        } finally {
          setLoading(false);
        }
      };

      xhr.open("POST", url, true);
      xhr.send(fd);
    } catch (err) {
      setPhase("error");
      setHint("");
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setError("");
    setHint("");
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const downloadTranscript = () => {
    if (!result || !result.ok) return;
    const base = (result.fileName || file?.name || "transcript").replace(
      /\.[^/.]+$/,
      ""
    );
    const blob = new Blob([result.transcript], {
      type: "text/plain;charset=utf-8"
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadAnalysis = () => {
    if (!result || !result.ok) return;
    const payload = {
      transcript: result.transcript,
      stats: result.stats,
      sections: result.sections ?? [],
      kpis: result.kpis ?? null,
      score: result.score ?? null,
      fileName: result.fileName ?? file?.name ?? undefined,
      generatedAt: new Date().toISOString()
    };
    const base = (result.fileName || file?.name || "call_analysis").replace(
      /\.[^/.]+$/,
      ""
    );
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Analyze an MP3
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Supported: <span className="font-medium">.mp3</span> • Max{" "}
            <span className="font-medium">50MB</span>. Drag &amp; drop or
            browse.
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex text-[11px] text-slate-500">
          <kbd className="rounded-md border bg-slate-50 px-1.5 py-0.5">⌘</kbd>
          <span>Drop to upload</span>
        </div>
      </div>

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        onClick={pickFile}
        onKeyDown={(e) =>
          e.key === "Enter" || e.key === " " ? pickFile() : undefined
        }
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`group relative grid cursor-pointer place-items-center rounded-xl border border-dashed p-6 transition ${
          file
            ? "border-slate-300 bg-slate-50/60"
            : "border-slate-300 bg-slate-50/40 hover:bg-slate-50"
        }`}
        aria-label="Upload MP3 by clicking or dragging a file here"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,audio/mpeg,audio/mp3"
          onChange={onInputChange}
          className="hidden"
        />

        {/* Icon + instructions */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 rounded-xl bg-slate-100 p-3 ring-1 ring-inset ring-white/40">
            {/* simple waveform glyph */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <rect
                x="2"
                y="10"
                width="2"
                height="4"
                rx="1"
                className="fill-slate-400"
              />
              <rect
                x="6"
                y="7"
                width="2"
                height="10"
                rx="1"
                className="fill-slate-400"
              />
              <rect
                x="10"
                y="5"
                width="2"
                height="14"
                rx="1"
                className="fill-slate-400"
              />
              <rect
                x="14"
                y="7"
                width="2"
                height="10"
                rx="1"
                className="fill-slate-400"
              />
              <rect
                x="18"
                y="10"
                width="2"
                height="4"
                rx="1"
                className="fill-slate-400"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-800">
            {file ? "File selected" : "Click to upload or drag & drop"}
          </p>
          <p className="mt-1 text-xs text-slate-500">MP3 only • up to 50MB</p>

          {file && (
            <div className="mt-3 w-full max-w-sm rounded-lg border border-slate-200 bg-white p-3 text-left">
              <p className="truncate text-sm text-slate-800" title={file.name}>
                <span className="font-medium">Name:</span> {file.name}
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-medium">Size:</span>{" "}
                {formatBytes(file.size)}
              </p>
            </div>
          )}
        </div>

        {/* Active border accent */}
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-indigo-200/0 transition group-hover:ring-4" />
      </div>

      {/* Hints & Errors */}
      <div className="mt-3 min-h-[20px] text-sm">
        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
            {error}
          </div>
        ) : hint ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
            {hint}
          </div>
        ) : null}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={analyze}
          disabled={!file || !!error || loading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:bg-gray-400"
        >
          {loading && (
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          )}
          {loading ? "Analyzing…" : "Analyze MP3"}
        </button>

        <button
          onClick={resetAll}
          disabled={loading || (!file && !result && !error && !hint)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Reset
        </button>
        {(phase === "uploading" || phase === "processing") && (
          <div className="mt-2 w-full">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>
                {phase === "uploading"
                  ? "Uploading…"
                  : "Processing (transcribe + analyze)…"}
              </span>
              <span>{progress}%</span>
            </div>
            <ProgressBar
              value={progress}
              indeterminate={phase === "processing" && progress < 60}
            />
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          {result.ok ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  Status:
                </span>
                <StatusBadge
                  text={result.passes ? "PASS" : "FAIL"}
                  good={result.passes}
                />
                {result.fileName && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                    {result.fileName}
                  </span>
                )}
              </div>

              {/* Top KPIs */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <KPIBlock
                  label="Duration"
                  value={`${formatSecs(result.stats.durationSec)}s`}
                />
                <KPIBlock
                  label="Word Count"
                  value={result.stats.wordCount ?? "—"}
                />
                <KPIBlock
                  label="Rules"
                  value={`≥ ${DEFAULT_RULES.minDurationSec ?? "—"}s • ≥ ${
                    DEFAULT_RULES.minWords ?? "—"
                  } words`}
                  sub={
                    result.failures.length
                      ? `${result.failures.length} issue(s)`
                      : "All checks passed"
                  }
                />
              </div>

              {/* Deeper KPIs + Score */}
              {(result.kpis || result.score) && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {result.score && (
                    <KPIBlock
                      label="Call Score"
                      value={`${result.score.total}/100`}
                    />
                  )}
                  {result.kpis && (
                    <>
                      <KPIBlock
                        label="% in Discovery"
                        value={`${(
                          result.kpis.percentTime.discovery ?? 0
                        ).toFixed(1)}%`}
                        sub="Target ~35–55%"
                      />
                      <KPIBlock
                        label="Time to Pricing"
                        value={formatMMSS(result.kpis.timeToPricingSec)}
                        sub="Sooner is not always better"
                      />
                    </>
                  )}
                </div>
              )}

              {/* Failures */}
              {result.failures.length > 0 && (
                <div className="mt-4">
                  <div className="mb-1 text-sm font-medium text-rose-700">
                    Failures
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-rose-700">
                    {result.failures.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.sections && result.sections.length > 0 && (
                <SectionTimeline secs={result.sections} />
              )}

              {/* Transcript */}
              <details className="mt-5 group">
                <summary className="cursor-pointer select-none text-sm font-medium text-slate-900 group-open:opacity-70">
                  Transcript
                </summary>
                <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-[13px] text-slate-800">
                  {result.transcript}
                </pre>
              </details>

              {/* Export buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={downloadTranscript}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Download Transcript (.txt)
                </button>
                <button
                  onClick={downloadAnalysis}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Download Analysis (.json)
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
              Error: {result.error || "Unknown error"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
