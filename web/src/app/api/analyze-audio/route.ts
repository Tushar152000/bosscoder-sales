import { NextRequest } from "next/server";

export const runtime = "nodejs";           // ensure Node runtime
export const dynamic = "force-dynamic";    // avoid caching uploads

// ---------- Types ----------
type Rules = {
  minDurationSec?: number;
  requireKeywords?: string[];
  forbiddenKeywords?: string[];
  minWords?: number;
};

type AnalyzeStats = { durationSec?: number; wordCount?: number };

type WordTimestamp = { start: number; end: number; word: string };

type WhisperSegment = {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: WordTimestamp[];
};

type WhisperOk = {
  ok: true;
  transcript: string;
  stats: AnalyzeStats;
  segments?: WhisperSegment[];
};
type WhisperErr = { ok: false; error: string };

type SectionName = "greeting" | "opening" | "discovery" | "pitch" | "pricing" | "closing";
type Section = { name: SectionName; t0: number; t1: number; confidence?: number; triggers?: string[] };

type KPIs = {
  totalSec: number;
  percentTime: Record<SectionName, number>;
  timeToPricingSec: number | null;
};

type Score = { total: number; detail: Record<string, number> };

type AnalyzeOk = {
  ok: true;
  transcript: string;
  passes: boolean;
  failures: string[];
  stats: AnalyzeStats;
  sections: Section[];
  kpis: KPIs;
  score: Score;
  fileName?: string;
};
type AnalyzeErr = { ok: false; error: string };
type AnalyzeResponse = AnalyzeOk | AnalyzeErr;

// ---------- Config ----------
const WHISPER_URL =
  process.env.WHISPER_URL ?? "http://127.0.0.1:8000/transcribe";

// ---------- Heuristic segmenter ----------
const ORDER = ["greeting", "opening", "discovery", "pitch", "pricing", "closing"] as const;

const SECTION_CUES: Record<SectionName, RegExp[]> = {
  greeting:  [/\b(hi|hello|hey|good (morning|afternoon|evening))\b/i, /thanks for (joining|taking the time)/i],
  opening:   [/\bagenda\b/i, /\b(today|on this call) (we|i)('?ll| will)\b/i, /\bbefore we start\b/i],
  discovery: [/\bcurrent (process|setup)\b/i, /\bpain(s| points)?\b/i, /\b(goals?|challenges?)\b/i, /\b(can|could) you (tell|walk) me\b/i],
  pitch:     [/\bdemo\b/i, /\b(let me )?show\b/i, /\bour (product|platform|solution)\b/i, /\bfeature(s)?\b/i],
  pricing:   [/\b(price|pricing|cost|budget|discount|contract|quote|per (seat|user|month))\b/i, /\bhow much\b/i, /\bwhat.*cost\b/i],
  closing:   [/\bnext steps\b/i, /\b(i|we)('?ll| will) (send|share|follow up)\b/i, /\btrial\b/i, /\bPOC\b/i]
};

function labelChunk(text: string): {
  label: SectionName;
  hits: SectionName[];
  triggers: string[];
} {
  const scores: Record<SectionName, number> = {
    greeting: 0, opening: 0, discovery: 0, pitch: 0, pricing: 0, closing: 0
  };
  const hits: SectionName[] = [];
  for (const name of ORDER) {
    for (const p of SECTION_CUES[name]) {
      if (p.test(text)) {
        scores[name] += 1;
        hits.push(name);
      }
    }
  }
  const best = (Object.keys(scores) as SectionName[])
    .sort((a, b) => (scores[b] - scores[a]) || (ORDER.indexOf(a) - ORDER.indexOf(b)))[0];

  // collect pricing triggers if any
  const triggers: string[] = [];
  for (const p of SECTION_CUES.pricing) {
    const m = text.match(p);
    if (m) triggers.push(m[0].toLowerCase());
  }

  return { label: scores[best] ? best : "discovery", hits, triggers };
}

function segmentize(segments: WhisperSegment[], minSec = 20): Section[] {
  if (!segments?.length) return [];

  type Block = {
    t0: number; t1: number; text: string;
    label: SectionName; triggers: string[];
  };

  const blocks: Block[] = [];
  let cur = { t0: segments[0].start, t1: segments[0].end, text: segments[0].text };

  for (let i = 1; i < segments.length; i++) {
    const s = segments[i];
    const curDur = cur.t1 - cur.t0;
    const gap = s.start - cur.t1;
    if (curDur < 25 && gap < 3) {
      cur = { t0: cur.t0, t1: s.end, text: (cur.text + " " + s.text).trim() };
    } else {
      const { label, triggers } = labelChunk(cur.text);
      blocks.push({ ...cur, label, triggers });
      cur = { t0: s.start, t1: s.end, text: s.text };
    }
  }
  const last = labelChunk(cur.text);
  blocks.push({ ...cur, label: last.label, triggers: last.triggers });

  // smooth sequence and merge adjacent same labels
  const out: Section[] = [];
  for (const b of blocks) {
    if (out.length && out[out.length - 1].name === b.label) {
      const prev = out[out.length - 1];
      prev.t1 = b.t1;
      if (b.label === "pricing") {
        const prevTrig = new Set(prev.triggers ?? []);
        for (const t of b.triggers) prevTrig.add(t);
        prev.triggers = Array.from(prevTrig);
      }
      continue;
    }
    const sec: Section = { name: b.label, t0: b.t0, t1: b.t1 };
    if (b.label === "pricing") {
      sec.confidence = 0.9;
      if (b.triggers.length) sec.triggers = Array.from(new Set(b.triggers));
    }
    out.push(sec);
  }

  // merge very short blips into neighbors (except pricing)
  for (let i = 1; i < out.length - 1; i++) {
    const s = out[i];
    if ((s.t1 - s.t0) < minSec && s.name !== "pricing") {
      out[i - 1].t1 = s.t1;
      out.splice(i, 1); i--;
    }
  }
  return out;
}

// ---------- KPIs & Score ----------
function computeKPIs(sections: Section[]): KPIs {
  const withDur = sections.map(s => ({ ...s, durationSec: +(s.t1 - s.t0).toFixed(1) }));
  const total = withDur.reduce((a, b) => a + (b.durationSec || 0), 0) || 1;

  const names: SectionName[] = ["greeting", "opening", "discovery", "pitch", "pricing", "closing"];
  const percentTime = names.reduce<Record<SectionName, number>>((acc, name) => {
    const dur = withDur
      .filter(s => s.name === name)
      .reduce((a, b) => a + (b.durationSec || 0), 0);
    acc[name] = +((dur / total) * 100).toFixed(1);
    return acc;
  }, { greeting: 0, opening: 0, discovery: 0, pitch: 0, pricing: 0, closing: 0 });

  const first = withDur[0];
  const pricing = withDur.find(s => s.name === "pricing");

  return {
    totalSec: +total.toFixed(1),
    percentTime,
    timeToPricingSec: pricing ? +(pricing.t0 - first.t0).toFixed(1) : null
  };
}

function scoreCall(kpis: KPIs): Score {
  let score = 0;
  const detail: Record<string, number> = {};

  // Discovery depth (0–35) – peak near 45%
  const disc = kpis.percentTime.discovery ?? 0;
  const discOK = Math.max(0, 1 - Math.abs(disc - 45) / 45);
  detail.discovery = Math.round(discOK * 35); score += detail.discovery;

  // Pricing presence (0–25)
  const pricingPct = kpis.percentTime.pricing ?? 0;
  detail.pricing = pricingPct > 3 ? 25 : pricingPct > 0 ? 12 : 0; score += detail.pricing;

  // Opening + Closing coverage (0–20)
  const oc = (kpis.percentTime.opening ?? 0) + (kpis.percentTime.closing ?? 0);
  const ocOK = Math.max(0, Math.min(1, oc / 20));
  detail.oppClose = Math.round(ocOK * 20); score += detail.oppClose;

  // Pitch balance (0–20) – don’t dominate the call
  const pitch = kpis.percentTime.pitch ?? 0;
  const pitchOK = pitch <= 50 ? 1 : Math.max(0, 1 - (pitch - 50) / 50);
  detail.pitchBalance = Math.round(pitchOK * 20); score += detail.pitchBalance;

  return { total: Math.max(0, Math.min(100, score)), detail };
}

// ---------- Handler ----------
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const rulesRaw = formData.get("rules");

    if (!(file instanceof File)) {
      return Response.json(
        { ok: false, error: "No file uploaded" } satisfies AnalyzeErr,
        { status: 400 }
      );
    }

    const rules: Rules = rulesRaw ? JSON.parse(String(rulesRaw)) : {};
    const fileName = file.name;

    // Forward to Whisper service
    const whisperForm = new FormData();
    whisperForm.append("file", file, fileName);
    whisperForm.append("model_size", "small");
    whisperForm.append("vad", "true");
    whisperForm.append("word_timestamps", "false");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 180_000);

    let whisperResp: Response;
    try {
      whisperResp = await fetch(WHISPER_URL, {
        method: "POST",
        body: whisperForm,
        signal: controller.signal
      });
    } catch (err) {
      clearTimeout(timer);
      const msg = err instanceof Error ? err.message : String(err);
      return Response.json(
        { ok: false, error: `Whisper server unreachable: ${msg}` } satisfies AnalyzeErr,
        { status: 502 }
      );
    }
    clearTimeout(timer);

    if (!whisperResp.ok) {
      const text = await whisperResp.text();
      return Response.json(
        { ok: false, error: `Whisper service error ${whisperResp.status}: ${text || "no body"}` } satisfies AnalyzeErr,
        { status: 502 }
      );
    }

    const json = (await whisperResp.json()) as WhisperOk | WhisperErr;
    if (!json.ok) {
      return Response.json(
        { ok: false, error: json.error || "Transcription failed" } satisfies AnalyzeErr,
        { status: 502 }
      );
    }

    const transcript = json.transcript || "";
    const stats: AnalyzeStats = {
      durationSec: json.stats?.durationSec,
      wordCount: json.stats?.wordCount
    };

    // ---- Rules ----
    const failures: string[] = [];
    if (
      typeof rules.minDurationSec === "number" &&
      typeof stats.durationSec === "number" &&
      stats.durationSec < rules.minDurationSec
    ) {
      failures.push(`Minimum duration ${rules.minDurationSec}s not met (got ${stats.durationSec}s).`);
    }
    if (typeof rules.minWords === "number") {
      const wc = stats.wordCount ?? 0;
      if (wc < rules.minWords) failures.push(`Minimum words ${rules.minWords} not met (got ${wc}).`);
    }
    const lower = transcript.toLowerCase();
    if (Array.isArray(rules.requireKeywords)) {
      for (const kw of rules.requireKeywords) {
        if (kw && !lower.includes(kw.toLowerCase())) failures.push(`Missing required keyword: "${kw}".`);
      }
    }
    if (Array.isArray(rules.forbiddenKeywords)) {
      for (const kw of rules.forbiddenKeywords) {
        if (kw && lower.includes(kw.toLowerCase())) failures.push(`Contains forbidden keyword: "${kw}".`);
      }
    }

    // ---- Segmentation + KPIs + Score ----
    const segments: WhisperSegment[] = json.segments ?? [];
    const sections: Section[] = segments.length
      ? segmentize(segments)
      : [{ name: "discovery", t0: 0, t1: stats.durationSec ?? 0 }];

    const kpis: KPIs = computeKPIs(sections);
    const score: Score = scoreCall(kpis);

    const resp: AnalyzeOk = {
      ok: true,
      transcript,
      passes: failures.length === 0,
      failures,
      stats,
      sections,
      kpis,
      score,
      fileName
    };

    return Response.json(resp);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected server error";
    return Response.json(
      { ok: false, error: msg } satisfies AnalyzeErr,
      { status: 500 }
    );
  }
}