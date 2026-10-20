"use client";

import { useState } from "react";

const METHODS = ["POST"];

export default function Home() {
  const [method, setMethod] = useState("POST");
  const [url, setUrl] = useState("http://localhost:8080/hello");
  const [body, setBody] = useState('{\n  "name": "Sadat"\n}');
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    setOutput("");
    const start = performance.now();
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      const time = Math.round(performance.now() - start);
      const text = await res.text();

      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch { }

      setOutput(`${res.status} ${res.statusText} · ${time}ms\n\n${pretty}`);
    } catch (err) {
      setOutput("Error: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4">
      <div className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-xl font-semibold">useFetch</h1>

        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-2 text-sm outline-none"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/route"
            className="min-w-0 flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-600"
          />

          <button
            onClick={send}
            disabled={loading}
            className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-950 disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          spellCheck={false}
          placeholder="JSON body"
          className="h-40 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900 p-3 font-mono text-sm outline-none focus:border-neutral-600"
        />

        <pre className="min-h-40 overflow-auto whitespace-pre-wrap break-words rounded-md border border-neutral-800 bg-neutral-900 p-3 font-mono text-sm text-neutral-300">
          {output || "Response will show here"}
        </pre>
      </div>
    </main>
  );
}
