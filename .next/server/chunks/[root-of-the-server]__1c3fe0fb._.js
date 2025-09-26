module.exports = [
"[project]/.next-internal/server/app/api/analyze-audio/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/analyze-audio/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
const runtime = "nodejs"; // ensure Node runtime
const dynamic = "force-dynamic"; // avoid caching uploads
// ---------- Config ----------
const WHISPER_URL = process.env.WHISPER_URL ?? "http://127.0.0.1:8000/transcribe";
// ---------- Heuristic segmenter ----------
const ORDER = [
    "greeting",
    "opening",
    "discovery",
    "pitch",
    "pricing",
    "closing"
];
const SECTION_CUES = {
    greeting: [
        /\b(hi|hello|hey|good (morning|afternoon|evening))\b/i,
        /thanks for (joining|taking the time)/i
    ],
    opening: [
        /\bagenda\b/i,
        /\b(today|on this call) (we|i)('?ll| will)\b/i,
        /\bbefore we start\b/i
    ],
    discovery: [
        /\bcurrent (process|setup)\b/i,
        /\bpain(s| points)?\b/i,
        /\b(goals?|challenges?)\b/i,
        /\b(can|could) you (tell|walk) me\b/i
    ],
    pitch: [
        /\bdemo\b/i,
        /\b(let me )?show\b/i,
        /\bour (product|platform|solution)\b/i,
        /\bfeature(s)?\b/i
    ],
    pricing: [
        /\b(price|pricing|cost|budget|discount|contract|quote|per (seat|user|month))\b/i,
        /\bhow much\b/i,
        /\bwhat.*cost\b/i
    ],
    closing: [
        /\bnext steps\b/i,
        /\b(i|we)('?ll| will) (send|share|follow up)\b/i,
        /\btrial\b/i,
        /\bPOC\b/i
    ]
};
function labelChunk(text) {
    const scores = {
        greeting: 0,
        opening: 0,
        discovery: 0,
        pitch: 0,
        pricing: 0,
        closing: 0
    };
    const hits = [];
    for (const name of ORDER){
        for (const p of SECTION_CUES[name]){
            if (p.test(text)) {
                scores[name] += 1;
                hits.push(name);
            }
        }
    }
    const best = Object.keys(scores).sort((a, b)=>scores[b] - scores[a] || ORDER.indexOf(a) - ORDER.indexOf(b))[0];
    // collect pricing triggers if any
    const triggers = [];
    for (const p of SECTION_CUES.pricing){
        const m = text.match(p);
        if (m) triggers.push(m[0].toLowerCase());
    }
    return {
        label: scores[best] ? best : "discovery",
        hits,
        triggers
    };
}
function segmentize(segments, minSec = 20) {
    if (!segments?.length) return [];
    const blocks = [];
    let cur = {
        t0: segments[0].start,
        t1: segments[0].end,
        text: segments[0].text
    };
    for(let i = 1; i < segments.length; i++){
        const s = segments[i];
        const curDur = cur.t1 - cur.t0;
        const gap = s.start - cur.t1;
        if (curDur < 25 && gap < 3) {
            cur = {
                t0: cur.t0,
                t1: s.end,
                text: (cur.text + " " + s.text).trim()
            };
        } else {
            const { label, triggers } = labelChunk(cur.text);
            blocks.push({
                ...cur,
                label,
                triggers
            });
            cur = {
                t0: s.start,
                t1: s.end,
                text: s.text
            };
        }
    }
    const last = labelChunk(cur.text);
    blocks.push({
        ...cur,
        label: last.label,
        triggers: last.triggers
    });
    // smooth sequence and merge adjacent same labels
    const out = [];
    for (const b of blocks){
        if (out.length && out[out.length - 1].name === b.label) {
            const prev = out[out.length - 1];
            prev.t1 = b.t1;
            if (b.label === "pricing") {
                const prevTrig = new Set(prev.triggers ?? []);
                for (const t of b.triggers)prevTrig.add(t);
                prev.triggers = Array.from(prevTrig);
            }
            continue;
        }
        const sec = {
            name: b.label,
            t0: b.t0,
            t1: b.t1
        };
        if (b.label === "pricing") {
            sec.confidence = 0.9;
            if (b.triggers.length) sec.triggers = Array.from(new Set(b.triggers));
        }
        out.push(sec);
    }
    // merge very short blips into neighbors (except pricing)
    for(let i = 1; i < out.length - 1; i++){
        const s = out[i];
        if (s.t1 - s.t0 < minSec && s.name !== "pricing") {
            out[i - 1].t1 = s.t1;
            out.splice(i, 1);
            i--;
        }
    }
    return out;
}
// ---------- KPIs & Score ----------
function computeKPIs(sections) {
    const withDur = sections.map((s)=>({
            ...s,
            durationSec: +(s.t1 - s.t0).toFixed(1)
        }));
    const total = withDur.reduce((a, b)=>a + (b.durationSec || 0), 0) || 1;
    const names = [
        "greeting",
        "opening",
        "discovery",
        "pitch",
        "pricing",
        "closing"
    ];
    const percentTime = names.reduce((acc, name)=>{
        const dur = withDur.filter((s)=>s.name === name).reduce((a, b)=>a + (b.durationSec || 0), 0);
        acc[name] = +(dur / total * 100).toFixed(1);
        return acc;
    }, {
        greeting: 0,
        opening: 0,
        discovery: 0,
        pitch: 0,
        pricing: 0,
        closing: 0
    });
    const first = withDur[0];
    const pricing = withDur.find((s)=>s.name === "pricing");
    return {
        totalSec: +total.toFixed(1),
        percentTime,
        timeToPricingSec: pricing ? +(pricing.t0 - first.t0).toFixed(1) : null
    };
}
function scoreCall(kpis) {
    let score = 0;
    const detail = {};
    // Discovery depth (0–35) – peak near 45%
    const disc = kpis.percentTime.discovery ?? 0;
    const discOK = Math.max(0, 1 - Math.abs(disc - 45) / 45);
    detail.discovery = Math.round(discOK * 35);
    score += detail.discovery;
    // Pricing presence (0–25)
    const pricingPct = kpis.percentTime.pricing ?? 0;
    detail.pricing = pricingPct > 3 ? 25 : pricingPct > 0 ? 12 : 0;
    score += detail.pricing;
    // Opening + Closing coverage (0–20)
    const oc = (kpis.percentTime.opening ?? 0) + (kpis.percentTime.closing ?? 0);
    const ocOK = Math.max(0, Math.min(1, oc / 20));
    detail.oppClose = Math.round(ocOK * 20);
    score += detail.oppClose;
    // Pitch balance (0–20) – don’t dominate the call
    const pitch = kpis.percentTime.pitch ?? 0;
    const pitchOK = pitch <= 50 ? 1 : Math.max(0, 1 - (pitch - 50) / 50);
    detail.pitchBalance = Math.round(pitchOK * 20);
    score += detail.pitchBalance;
    return {
        total: Math.max(0, Math.min(100, score)),
        detail
    };
}
async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const rulesRaw = formData.get("rules");
        if (!(file instanceof File)) {
            return Response.json({
                ok: false,
                error: "No file uploaded"
            }, {
                status: 400
            });
        }
        const rules = rulesRaw ? JSON.parse(String(rulesRaw)) : {};
        const fileName = file.name;
        // Forward to Whisper service
        const whisperForm = new FormData();
        whisperForm.append("file", file, fileName);
        whisperForm.append("model_size", "small");
        whisperForm.append("vad", "true");
        whisperForm.append("word_timestamps", "false");
        const controller = new AbortController();
        const timer = setTimeout(()=>controller.abort(), 180_000);
        let whisperResp;
        try {
            whisperResp = await fetch(WHISPER_URL, {
                method: "POST",
                body: whisperForm,
                signal: controller.signal
            });
        } catch (err) {
            clearTimeout(timer);
            const msg = err instanceof Error ? err.message : String(err);
            return Response.json({
                ok: false,
                error: `Whisper server unreachable: ${msg}`
            }, {
                status: 502
            });
        }
        clearTimeout(timer);
        if (!whisperResp.ok) {
            const text = await whisperResp.text();
            return Response.json({
                ok: false,
                error: `Whisper service error ${whisperResp.status}: ${text || "no body"}`
            }, {
                status: 502
            });
        }
        const json = await whisperResp.json();
        if (!json.ok) {
            return Response.json({
                ok: false,
                error: json.error || "Transcription failed"
            }, {
                status: 502
            });
        }
        const transcript = json.transcript || "";
        const stats = {
            durationSec: json.stats?.durationSec,
            wordCount: json.stats?.wordCount
        };
        // ---- Rules ----
        const failures = [];
        if (typeof rules.minDurationSec === "number" && typeof stats.durationSec === "number" && stats.durationSec < rules.minDurationSec) {
            failures.push(`Minimum duration ${rules.minDurationSec}s not met (got ${stats.durationSec}s).`);
        }
        if (typeof rules.minWords === "number") {
            const wc = stats.wordCount ?? 0;
            if (wc < rules.minWords) failures.push(`Minimum words ${rules.minWords} not met (got ${wc}).`);
        }
        const lower = transcript.toLowerCase();
        if (Array.isArray(rules.requireKeywords)) {
            for (const kw of rules.requireKeywords){
                if (kw && !lower.includes(kw.toLowerCase())) failures.push(`Missing required keyword: "${kw}".`);
            }
        }
        if (Array.isArray(rules.forbiddenKeywords)) {
            for (const kw of rules.forbiddenKeywords){
                if (kw && lower.includes(kw.toLowerCase())) failures.push(`Contains forbidden keyword: "${kw}".`);
            }
        }
        // ---- Segmentation + KPIs + Score ----
        const segments = json.segments ?? [];
        const sections = segments.length ? segmentize(segments) : [
            {
                name: "discovery",
                t0: 0,
                t1: stats.durationSec ?? 0
            }
        ];
        const kpis = computeKPIs(sections);
        const score = scoreCall(kpis);
        const resp = {
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
        return Response.json({
            ok: false,
            error: msg
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1c3fe0fb._.js.map