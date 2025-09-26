(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/components/AudioAnalyzeUploader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AudioAnalyzeUploader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
/* =========================
   Config & helpers
   ========================= */ const DEFAULT_RULES = {
    minDurationSec: 15,
    requireKeywords: [],
    forbiddenKeywords: [],
    minWords: 20
};
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const formatSecs = (n)=>typeof n === "number" ? n.toFixed(1) : "—";
const formatMMSS = (sec)=>{
    if (sec == null || isNaN(sec)) return "—";
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return "".concat(m, ":").concat(r.toString().padStart(2, "0"));
};
const formatBytes = (b)=>b < 1024 ? "".concat(b, " B") : b < 1024 * 1024 ? "".concat((b / 1024).toFixed(1), " KB") : "".concat((b / (1024 * 1024)).toFixed(1), " MB");
const SECTION_COLORS = {
    greeting: "#E5E7EB",
    opening: "#C7D2FE",
    discovery: "#BBF7D0",
    pitch: "#FDE68A",
    pricing: "#FCA5A5",
    closing: "#A7F3D0"
};
function StatusBadge(param) {
    let { text, good } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ".concat(good ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "h-1.5 w-1.5 rounded-full ".concat(good ? "bg-emerald-500" : "bg-rose-500")
            }, void 0, false, {
                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                lineNumber: 91,
                columnNumber: 7
            }, this),
            text
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
        lineNumber: 84,
        columnNumber: 5
    }, this);
}
_c = StatusBadge;
function SectionTimeline(param) {
    let { secs } = param;
    _s();
    const withDur = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SectionTimeline.useMemo[withDur]": ()=>secs.map({
                "SectionTimeline.useMemo[withDur]": (s)=>({
                        ...s,
                        dur: s.t1 - s.t0
                    })
            }["SectionTimeline.useMemo[withDur]"])
    }["SectionTimeline.useMemo[withDur]"], [
        secs
    ]);
    const total = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SectionTimeline.useMemo[total]": ()=>withDur.reduce({
                "SectionTimeline.useMemo[total]": (a, b)=>a + b.dur
            }["SectionTimeline.useMemo[total]"], 0) || 1
    }["SectionTimeline.useMemo[total]"], [
        withDur
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-2 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm font-medium text-slate-900",
                        children: "Call Timeline"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2 text-[11px] text-slate-600",
                        children: Object.keys(SECTION_COLORS).map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center gap-1 rounded px-2 py-0.5 ring-1 ring-slate-200 bg-white",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-block h-2 w-2 rounded-full",
                                        style: {
                                            background: SECTION_COLORS[n]
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                        lineNumber: 121,
                                        columnNumber: 15
                                    }, this),
                                    n
                                ]
                            }, n, true, {
                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                lineNumber: 117,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-3 w-full overflow-hidden rounded bg-slate-100 ring-1 ring-inset ring-slate-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-full",
                    children: withDur.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            title: "".concat(s.name, " (").concat(s.dur.toFixed(1), "s)"),
                            style: {
                                width: "".concat(s.dur / total * 100, "%"),
                                background: SECTION_COLORS[s.name]
                            },
                            className: "h-full"
                        }, i, false, {
                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                            lineNumber: 133,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                    lineNumber: 131,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                lineNumber: 130,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
        lineNumber: 112,
        columnNumber: 5
    }, this);
}
_s(SectionTimeline, "sJETwKkX7kx5u5ZiRDydHgJZFro=");
_c1 = SectionTimeline;
function KPIBlock(param) {
    let { label, value, sub } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-md border border-slate-200 bg-slate-50 px-3 py-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-slate-500",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-lg font-semibold text-slate-900",
                children: value
            }, void 0, false, {
                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, this),
            sub && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-0.5 text-[11px] text-slate-500",
                children: sub
            }, void 0, false, {
                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                lineNumber: 162,
                columnNumber: 15
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
        lineNumber: 159,
        columnNumber: 5
    }, this);
}
_c2 = KPIBlock;
function ProgressBar(param) {
    let { value, indeterminate } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-3 h-2 w-full overflow-hidden rounded bg-slate-100",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full transition-all ".concat(indeterminate ? "animate-pulse bg-indigo-300" : "bg-indigo-500"),
            style: {
                width: indeterminate ? "40%" : "".concat(Math.max(0, Math.min(100, value)), "%")
            }
        }, void 0, false, {
            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
            lineNumber: 176,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
        lineNumber: 175,
        columnNumber: 5
    }, this);
}
_c3 = ProgressBar;
function AudioAnalyzeUploader() {
    _s1();
    const [file, setFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [hint, setHint] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0); // 0..100
    const [phase, setPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const validate = (f)=>{
        if (!f) return "Please select an MP3 file.";
        const isMp3 = f.type === "audio/mpeg" || f.type === "audio/mp3" || /\.mp3$/i.test(f.name);
        if (!isMp3) return "Only .mp3 files are supported.";
        if (f.size > MAX_SIZE_BYTES) return "Max file size is 50 MB.";
        return "";
    };
    const assignFile = (f)=>{
        const e = validate(f);
        setError(e);
        setHint(e ? "" : "Ready to analyze.");
        setFile(e ? null : f);
        setResult(null);
    };
    const onInputChange = (e)=>{
        var _e_target_files;
        var _e_target_files_;
        return assignFile((_e_target_files_ = (_e_target_files = e.target.files) === null || _e_target_files === void 0 ? void 0 : _e_target_files[0]) !== null && _e_target_files_ !== void 0 ? _e_target_files_ : null);
    };
    const onDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AudioAnalyzeUploader.useCallback[onDrop]": (e)=>{
            var _e_dataTransfer_files;
            e.preventDefault();
            var _e_dataTransfer_files_;
            assignFile((_e_dataTransfer_files_ = (_e_dataTransfer_files = e.dataTransfer.files) === null || _e_dataTransfer_files === void 0 ? void 0 : _e_dataTransfer_files[0]) !== null && _e_dataTransfer_files_ !== void 0 ? _e_dataTransfer_files_ : null);
        }
    }["AudioAnalyzeUploader.useCallback[onDrop]"], []);
    const onDragOver = (e)=>{
        e.preventDefault();
        setHint("Drop to upload");
    };
    const onDragLeave = ()=>setHint(file ? "Ready to analyze." : "");
    const pickFile = ()=>{
        var _inputRef_current;
        return (_inputRef_current = inputRef.current) === null || _inputRef_current === void 0 ? void 0 : _inputRef_current.click();
    };
    const analyze = async ()=>{
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
            xhr.upload.onprogress = (e)=>{
                if (e.lengthComputable) {
                    const pct = Math.round(e.loaded / e.total * 100);
                    setProgress(pct);
                }
            };
            // After upload finished but before server responds, show “processing”
            xhr.upload.onload = ()=>{
                setPhase("processing");
                // Smooth “indeterminate-like” progress while we wait
                let p = 60; // start around 60% to feel responsive
                setProgress(p);
                const tick = setInterval(()=>{
                    p = Math.min(95, p + 1 + Math.random() * 2); // creep to 95%
                    setProgress(Math.round(p));
                }, 300);
                xhr.onreadystatechange = ()=>{
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        clearInterval(tick);
                    }
                };
            };
            xhr.onerror = ()=>{
                setPhase("error");
                setHint("");
                setError("Network error while uploading/processing the file.");
                setLoading(false);
            };
            xhr.onload = ()=>{
                try {
                    if (xhr.status < 200 || xhr.status >= 300) {
                        setPhase("error");
                        setHint("");
                        setError("Server error ".concat(xhr.status, ": ").concat(xhr.responseText));
                        setLoading(false);
                        return;
                    }
                    const json = JSON.parse(xhr.responseText);
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
                    setHint(json.passes ? "Analysis passed." : "Analysis completed (failed).");
                } catch (e) {
                    setPhase("error");
                    setHint("");
                    setError(e instanceof Error ? e.message : "Failed to parse server response.");
                } finally{
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
    const resetAll = ()=>{
        setFile(null);
        setError("");
        setHint("");
        setResult(null);
        if (inputRef.current) inputRef.current.value = "";
    };
    const downloadTranscript = ()=>{
        if (!result || !result.ok) return;
        const base = (result.fileName || (file === null || file === void 0 ? void 0 : file.name) || "transcript").replace(/\.[^/.]+$/, "");
        const blob = new Blob([
            result.transcript
        ], {
            type: "text/plain;charset=utf-8"
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "".concat(base, ".txt");
        a.click();
        window.URL.revokeObjectURL(url);
    };
    const downloadAnalysis = ()=>{
        if (!result || !result.ok) return;
        var _result_sections, _result_kpis, _result_score, _result_fileName, _ref;
        const payload = {
            transcript: result.transcript,
            stats: result.stats,
            sections: (_result_sections = result.sections) !== null && _result_sections !== void 0 ? _result_sections : [],
            kpis: (_result_kpis = result.kpis) !== null && _result_kpis !== void 0 ? _result_kpis : null,
            score: (_result_score = result.score) !== null && _result_score !== void 0 ? _result_score : null,
            fileName: (_ref = (_result_fileName = result.fileName) !== null && _result_fileName !== void 0 ? _result_fileName : file === null || file === void 0 ? void 0 : file.name) !== null && _ref !== void 0 ? _ref : undefined,
            generatedAt: new Date().toISOString()
        };
        const base = (result.fileName || (file === null || file === void 0 ? void 0 : file.name) || "call_analysis").replace(/\.[^/.]+$/, "");
        const blob = new Blob([
            JSON.stringify(payload, null, 2)
        ], {
            type: "application/json;charset=utf-8"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "".concat(base, ".json");
        a.click();
        URL.revokeObjectURL(url);
    };
    var _result_stats_wordCount, _DEFAULT_RULES_minDurationSec, _DEFAULT_RULES_minWords, _result_kpis_percentTime_discovery;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "my-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4 flex items-start justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold text-slate-900",
                                children: "Analyze an MP3"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                lineNumber: 386,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-slate-500",
                                children: [
                                    "Supported: ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium",
                                        children: ".mp3"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                        lineNumber: 390,
                                        columnNumber: 24
                                    }, this),
                                    " • Max",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium",
                                        children: "50MB"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                        lineNumber: 391,
                                        columnNumber: 13
                                    }, this),
                                    ". Drag & drop or browse."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                lineNumber: 389,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                        lineNumber: 385,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hidden items-center gap-2 sm:flex text-[11px] text-slate-500",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                                className: "rounded-md border bg-slate-50 px-1.5 py-0.5",
                                children: "⌘"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                lineNumber: 396,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Drop to upload"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                lineNumber: 397,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                        lineNumber: 395,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                lineNumber: 384,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "button",
                tabIndex: 0,
                onClick: pickFile,
                onKeyDown: (e)=>e.key === "Enter" || e.key === " " ? pickFile() : undefined,
                onDrop: onDrop,
                onDragOver: onDragOver,
                onDragLeave: onDragLeave,
                className: "group relative grid cursor-pointer place-items-center rounded-xl border border-dashed p-6 transition ".concat(file ? "border-slate-300 bg-slate-50/60" : "border-slate-300 bg-slate-50/40 hover:bg-slate-50"),
                "aria-label": "Upload MP3 by clicking or dragging a file here",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: inputRef,
                        type: "file",
                        accept: ".mp3,audio/mpeg,audio/mp3",
                        onChange: onInputChange,
                        className: "hidden"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                        lineNumber: 419,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-2 rounded-xl bg-slate-100 p-3 ring-1 ring-inset ring-white/40",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "28",
                                    height: "28",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    "aria-hidden": true,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                            x: "2",
                                            y: "10",
                                            width: "2",
                                            height: "4",
                                            rx: "1",
                                            className: "fill-slate-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                            lineNumber: 438,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                            x: "6",
                                            y: "7",
                                            width: "2",
                                            height: "10",
                                            rx: "1",
                                            className: "fill-slate-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                            lineNumber: 446,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                            x: "10",
                                            y: "5",
                                            width: "2",
                                            height: "14",
                                            rx: "1",
                                            className: "fill-slate-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                            lineNumber: 454,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                            x: "14",
                                            y: "7",
                                            width: "2",
                                            height: "10",
                                            rx: "1",
                                            className: "fill-slate-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                            lineNumber: 462,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                            x: "18",
                                            y: "10",
                                            width: "2",
                                            height: "4",
                                            rx: "1",
                                            className: "fill-slate-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                            lineNumber: 470,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 431,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                lineNumber: 429,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-medium text-slate-800",
                                children: file ? "File selected" : "Click to upload or drag & drop"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                lineNumber: 480,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-slate-500",
                                children: "MP3 only • up to 50MB"
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                lineNumber: 483,
                                columnNumber: 11
                            }, this),
                            file && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3 w-full max-w-sm rounded-lg border border-slate-200 bg-white p-3 text-left",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "truncate text-sm text-slate-800",
                                        title: file.name,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium",
                                                children: "Name:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                                lineNumber: 488,
                                                columnNumber: 17
                                            }, this),
                                            " ",
                                            file.name
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                        lineNumber: 487,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium",
                                                children: "Size:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                                lineNumber: 491,
                                                columnNumber: 17
                                            }, this),
                                            " ",
                                            formatBytes(file.size)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                        lineNumber: 490,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                lineNumber: 486,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                        lineNumber: 428,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pointer-events-none absolute inset-0 rounded-xl ring-0 ring-indigo-200/0 transition group-hover:ring-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                        lineNumber: 499,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                lineNumber: 402,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 min-h-[20px] text-sm",
                children: error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                    lineNumber: 505,
                    columnNumber: 11
                }, this) : hint ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700",
                    children: hint
                }, void 0, false, {
                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                    lineNumber: 509,
                    columnNumber: 11
                }, this) : null
            }, void 0, false, {
                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                lineNumber: 503,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 flex flex-wrap items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: analyze,
                        disabled: !file || !!error || loading,
                        className: "inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:bg-gray-400",
                        children: [
                            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "h-4 w-4 animate-spin",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                "aria-hidden": true,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        className: "opacity-25",
                                        cx: "12",
                                        cy: "12",
                                        r: "10",
                                        stroke: "currentColor",
                                        strokeWidth: "4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                        lineNumber: 529,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        className: "opacity-75",
                                        d: "M4 12a8 8 0 018-8",
                                        stroke: "currentColor",
                                        strokeWidth: "4",
                                        strokeLinecap: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                        lineNumber: 537,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                lineNumber: 523,
                                columnNumber: 13
                            }, this),
                            loading ? "Analyzing…" : "Analyze MP3"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                        lineNumber: 517,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: resetAll,
                        disabled: loading || !file && !result && !error && !hint,
                        className: "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60",
                        children: "Reset"
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                        lineNumber: 549,
                        columnNumber: 9
                    }, this),
                    (phase === "uploading" || phase === "processing") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between text-xs text-slate-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: phase === "uploading" ? "Uploading…" : "Processing (transcribe + analyze)…"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                        lineNumber: 559,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            progress,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                        lineNumber: 564,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                lineNumber: 558,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProgressBar, {
                                value: progress,
                                indeterminate: phase === "processing" && progress < 60
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                lineNumber: 566,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                        lineNumber: 557,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                lineNumber: 516,
                columnNumber: 7
            }, this),
            result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-5 rounded-lg border border-slate-200 bg-white p-4",
                children: result.ok ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm font-semibold text-slate-900",
                                    children: "Status:"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 580,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBadge, {
                                    text: result.passes ? "PASS" : "FAIL",
                                    good: result.passes
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 583,
                                    columnNumber: 17
                                }, this),
                                result.fileName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600",
                                    children: result.fileName
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 588,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                            lineNumber: 579,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 grid gap-3 sm:grid-cols-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(KPIBlock, {
                                    label: "Duration",
                                    value: "".concat(formatSecs(result.stats.durationSec), "s")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 596,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(KPIBlock, {
                                    label: "Word Count",
                                    value: (_result_stats_wordCount = result.stats.wordCount) !== null && _result_stats_wordCount !== void 0 ? _result_stats_wordCount : "—"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 600,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(KPIBlock, {
                                    label: "Rules",
                                    value: "≥ ".concat((_DEFAULT_RULES_minDurationSec = DEFAULT_RULES.minDurationSec) !== null && _DEFAULT_RULES_minDurationSec !== void 0 ? _DEFAULT_RULES_minDurationSec : "—", "s • ≥ ").concat((_DEFAULT_RULES_minWords = DEFAULT_RULES.minWords) !== null && _DEFAULT_RULES_minWords !== void 0 ? _DEFAULT_RULES_minWords : "—", " words"),
                                    sub: result.failures.length ? "".concat(result.failures.length, " issue(s)") : "All checks passed"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 604,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                            lineNumber: 595,
                            columnNumber: 15
                        }, this),
                        (result.kpis || result.score) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 grid gap-3 sm:grid-cols-3",
                            children: [
                                result.score && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(KPIBlock, {
                                    label: "Call Score",
                                    value: "".concat(result.score.total, "/100")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 621,
                                    columnNumber: 21
                                }, this),
                                result.kpis && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(KPIBlock, {
                                            label: "% in Discovery",
                                            value: "".concat(((_result_kpis_percentTime_discovery = result.kpis.percentTime.discovery) !== null && _result_kpis_percentTime_discovery !== void 0 ? _result_kpis_percentTime_discovery : 0).toFixed(1), "%"),
                                            sub: "Target ~35–55%"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                            lineNumber: 628,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(KPIBlock, {
                                            label: "Time to Pricing",
                                            value: formatMMSS(result.kpis.timeToPricingSec),
                                            sub: "Sooner is not always better"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                            lineNumber: 635,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                            lineNumber: 619,
                            columnNumber: 17
                        }, this),
                        result.failures.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-1 text-sm font-medium text-rose-700",
                                    children: "Failures"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 648,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "list-disc space-y-1 pl-5 text-sm text-rose-700",
                                    children: result.failures.map((f, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: f
                                        }, i, false, {
                                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                            lineNumber: 653,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 651,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                            lineNumber: 647,
                            columnNumber: 17
                        }, this),
                        result.sections && result.sections.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionTimeline, {
                            secs: result.sections
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                            lineNumber: 660,
                            columnNumber: 17
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                            className: "mt-5 group",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                    className: "cursor-pointer select-none text-sm font-medium text-slate-900 group-open:opacity-70",
                                    children: "Transcript"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 665,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                    className: "mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-[13px] text-slate-800",
                                    children: result.transcript
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 668,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                            lineNumber: 664,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 flex flex-wrap gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: downloadTranscript,
                                    className: "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
                                    children: "Download Transcript (.txt)"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 675,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: downloadAnalysis,
                                    className: "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
                                    children: "Download Analysis (.json)"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                                    lineNumber: 681,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                            lineNumber: 674,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700",
                    children: [
                        "Error: ",
                        result.error || "Unknown error"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                    lineNumber: 690,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
                lineNumber: 576,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/AudioAnalyzeUploader.tsx",
        lineNumber: 382,
        columnNumber: 5
    }, this);
}
_s1(AudioAnalyzeUploader, "9Yd9PBNZR1q5HOeOtPhGjFW9Qc4=");
_c4 = AudioAnalyzeUploader;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "StatusBadge");
__turbopack_context__.k.register(_c1, "SectionTimeline");
__turbopack_context__.k.register(_c2, "KPIBlock");
__turbopack_context__.k.register(_c3, "ProgressBar");
__turbopack_context__.k.register(_c4, "AudioAnalyzeUploader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/components/AudioAnalyzeUploader.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/components/AudioAnalyzeUploader.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_app_components_AudioAnalyzeUploader_tsx_7af1b431._.js.map