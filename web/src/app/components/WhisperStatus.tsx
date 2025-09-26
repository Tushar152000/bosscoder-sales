// app/components/WhisperStatus.tsx
"use client";
import { useEffect, useState } from "react";

export default function WhisperStatus() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/analyze-audio/whisper-health")
      .then(async (r) => {
        setOk(r.ok);
      })
      .catch(() => setOk(false));
  }, []);

  return (
    <span
      className={`text-xs ${
        ok
          ? "text-emerald-600"
          : ok === false
          ? "text-rose-600"
          : "text-slate-400"
      }`}
    >
      {ok === null
        ? "Checking Whisper…"
        : ok
        ? "Whisper online"
        : "Whisper offline"}
    </span>
  );
}
