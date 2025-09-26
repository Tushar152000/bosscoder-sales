export const runtime = "nodejs";

export async function GET() {
  // Default to your running FastAPI instance on port 8080
  const baseUrl = process.env.WHISPER_URL ?? "http://127.0.0.1:8080/transcribe";
  const url = baseUrl.replace("/transcribe", "/health");

  try {
    const r = await fetch(url, { cache: "no-store" });
    const text = await r.text();

    console.log("Whisper health ->", r.status, text);

    // Forward the health body for easier debugging in browser
    return new Response(text || null, {
      status: r.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Whisper health error ->", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}