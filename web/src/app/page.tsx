import React from "react";
import AudioAnalyzeUploader from "./components/AudioAnalyzeUploader";
import WhisperStatus from "./components/WhisperStatus";
import AnalysisDashboard from "./components/AnalysisDashboard";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 shadow-inner" />
            <span className="text-base font-semibold tracking-tight text-slate-800">
              Bosscoder MP3 Analyzer
            </span>



          </div>
          {/* <div className="text-xs text-slate-500">
            <span className="hidden sm:inline">
              Analyze • Visualize • Export
            </span>
          </div> */}
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto mt-6 w-full max-w-6xl ">
        {/* <AudioAnalyzeUploader /> */}
        <AnalysisDashboard />

        {/* Whisper server status (optional display) */}
        <div className="mt-6">
          <WhisperStatus />
        </div>
      </div>

      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_600px_at_80%_-10%,rgba(79,70,229,0.06),transparent_70%)]" />
    </main>
  );
}
