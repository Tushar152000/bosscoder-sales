"use client";
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from "recharts";

/* =========================
   Shared Types (match your API)
   ========================= */
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

type AnalyzeStats = { durationSec?: number; wordCount?: number };

export type AnalysisItem = {
  id: string;
  fileName?: string;
  createdAt: string; // ISO
  transcript: string;
  stats: AnalyzeStats;
  sections?: Section[];
  kpis?: KPIs;
  score?: Score;
};

/* =========================
   Colors & helpers
   ========================= */
const SECTION_COLORS: Record<SectionName, string> = {
  greeting: "#E5E7EB",
  opening: "#C7D2FE",
  discovery: "#BBF7D0",
  pitch: "#FDE68A",
  pricing: "#FCA5A5",
  closing: "#A7F3D0"
};

const fmtMMSS = (sec?: number | null) => {
  if (sec == null || isNaN(sec)) return "—";
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
};

/* =========================
   Dashboard Shell
   ========================= */
export default function AnalysisDashboard() {
  const [items, setItems] = useState<AnalysisItem[]>([]);

  // Aggregations
  const scoreSeries = useMemo(
    () =>
      items
        .filter((it) => it.score)
        .map((it, i) => ({
          idx: i + 1,
          score: it.score?.total ?? 0,
          label: new Date(it.createdAt).toLocaleDateString()
        })),
    [items]
  );

  const avgPercentTime = useMemo(() => {
    const acc: Record<SectionName, number> = {
      greeting: 0,
      opening: 0,
      discovery: 0,
      pitch: 0,
      pricing: 0,
      closing: 0
    };
    let n = 0;
    for (const it of items) {
      if (!it.kpis) continue;
      for (const k of Object.keys(acc) as SectionName[]) {
        acc[k] += it.kpis.percentTime[k] || 0;
      }
      n++;
    }
    if (n === 0) return acc;
    for (const k of Object.keys(acc) as SectionName[])
      acc[k] = +(acc[k] / n).toFixed(1);
    return acc;
  }, [items]);

  const durationSeries = useMemo(() => {
    return items.map((it, i) => ({
      idx: i + 1,
      minutes: (it.stats.durationSec || 0) / 60,
      label: it.fileName || `Call ${i + 1}`
    }));
  }, [items]);

  const topTable = useMemo(() => {
    return items
      .slice()
      .sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0))
      .slice(0, 8);
  }, [items]);

  const handleAdd = (res: any) => {
    if (!res?.ok) return;
    const id = crypto.randomUUID();
    const item: AnalysisItem = {
      id,
      fileName: res.fileName,
      createdAt: new Date().toISOString(),
      transcript: res.transcript,
      stats: res.stats,
      sections: res.sections,
      kpis: res.kpis,
      score: res.score
    };
    setItems((prev) => [item, ...prev]);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Call Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Track scores, durations, and talk-track balance across calls.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Avg Discovery: {avgPercentTime.discovery.toFixed(1)}%
        </div>
      </div>

      {/* Uploader slot – import your existing component and pass onAnalyzed */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <DashboardUploaderBridge onAnalyzed={handleAdd} />
      </div>

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-3">
        <KPI label="Calls Analyzed" value={items.length} />
        <KPI
          label="Avg Score"
          value={
            items.length
              ? Math.round(
                  items.reduce((a, b) => a + (b.score?.total || 0), 0) /
                    items.length
                )
              : "—"
          }
          suffix={items.length ? "/100" : undefined}
        />
        <KPI
          label="Avg Duration"
          value={
            items.length
              ? `${(
                  items.reduce((a, b) => a + (b.stats.durationSec || 0), 0) /
                  items.length /
                  60
                ).toFixed(1)}m`
              : "—"
          }
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Score over time">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={scoreSeries} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="idx" tickFormatter={(v) => `#${v}`} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#4F46E5"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Avg section mix">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={Object.entries(avgPercentTime).map(([name, value]) => ({
                  name,
                  value
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(d) => `${d.name}: ${d.value}%`}
              >
                {Object.entries(avgPercentTime).map(([name], i) => (
                  <Cell key={name} fill={Object.values(SECTION_COLORS)[i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Durations (minutes)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={durationSeries} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="minutes" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Latest calls">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-2 py-2">When</th>
                  <th className="px-2 py-2">File</th>
                  <th className="px-2 py-2">Score</th>
                  <th className="px-2 py-2">Duration</th>
                  <th className="px-2 py-2">Time→Pricing</th>
                </tr>
              </thead>
              <tbody>
                {topTable.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-2 py-3 text-slate-500">
                      No calls yet. Upload one above.
                    </td>
                  </tr>
                )}
                {topTable.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="px-2 py-2 text-slate-600">
                      {new Date(it.createdAt).toLocaleString()}
                    </td>
                    <td className="px-2 py-2">{it.fileName || "—"}</td>
                    <td className="px-2 py-2 font-medium">
                      {it.score?.total ?? "—"}
                    </td>
                    <td className="px-2 py-2">
                      {((it.stats.durationSec || 0) / 60).toFixed(1)}m
                    </td>
                    <td className="px-2 py-2">
                      {fmtMMSS(it.kpis?.timeToPricingSec)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}

/* ===== FIXED: no require(), use next/dynamic instead ===== */
function DashboardUploaderBridge({
  onAnalyzed
}: {
  onAnalyzed: (res: any) => void;
}) {
  const AudioAnalyzeUploader = useMemo(
    () =>
      dynamic(() => import("./AudioAnalyzeUploader"), {
        ssr: false
      }),
    []
  );
  return (
    <AudioAnalyzeUploaderWrapper
      onAnalyzed={onAnalyzed}
      Component={AudioAnalyzeUploader}
    />
  );
}

function AudioAnalyzeUploaderWrapper({
  Component,
  onAnalyzed
}: {
  Component: any;
  onAnalyzed: (res: any) => void;
}) {
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.ok) onAnalyzed(detail);
    };
    window.addEventListener("analysis:done", handler as EventListener);
    return () =>
      window.removeEventListener("analysis:done", handler as EventListener);
  }, [onAnalyzed]);
  return <Component />;
}

function Card({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-900">{title}</div>
      {children}
    </div>
  );
}

function KPI({
  label,
  value,
  suffix
}: {
  label: string;
  value: React.ReactNode;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
        {suffix && (
          <span className="ml-1 text-base text-slate-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}
