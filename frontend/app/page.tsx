"use client";
import { useEffect, useState } from "react";

// api methods
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
type Method = (typeof METHODS)[number];

// localStorage keys
const BASES_KEY = "fetcher:baseUrls";
const ACTIVE_KEY = "fetcher:activeBaseUrl";

// join base url + path (full urls are used as they are)
function buildUrl(base: string | null, input: string): string {
  const trimmed: string = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (!base) return trimmed;
  return base.replace(/\/+$/, "") + "/" + trimmed.replace(/^\/+/, "");
}

export default function Home() {
  // request states
  const [method, setMethod] = useState<Method>("POST");
  const [url, setUrl] = useState<string>("/");
  const [body, setBody] = useState<string>('{\n  "username": "name"\n}');
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // base url states
  const [baseUrls, setBaseUrls] = useState<string[]>(["http://localhost:8080"]);
  const [activeBase, setActiveBase] = useState<string | null>("http://localhost:8080");
  const [newBase, setNewBase] = useState<string>("");
  const [baseError, setBaseError] = useState<string>("");
  const [loaded, setLoaded] = useState<boolean>(false);

  // load the base urls
  useEffect(() => {
    try {
      const savedBases: string | null = localStorage.getItem(BASES_KEY);
      const savedActive: string | null = localStorage.getItem(ACTIVE_KEY);

      if (savedBases) {
        const parsed: unknown = JSON.parse(savedBases);
        if (Array.isArray(parsed)) {
          setBaseUrls(parsed.filter((b): b is string => typeof b === "string"));
        }
      }

      if (savedActive !== null) {
        setActiveBase(savedActive || null);
      }

    } catch { }
    setLoaded(true);
  }, []);

  // save to localStorage
  useEffect(() => {

    if (!loaded) return;

    try {
      localStorage.setItem(BASES_KEY, JSON.stringify(baseUrls));
      localStorage.setItem(ACTIVE_KEY, activeBase ?? "");

    } catch { }

  }, [baseUrls, activeBase, loaded]);

  // add a base url
  function addBase(): void {
    const value: string = newBase.trim().replace(/\/+$/, "");

    if (!/^https?:\/\/.+/i.test(value)) {
      setBaseError("Must start with http:// or https://");
      return;
    }
    if (baseUrls.includes(value)) {
      setBaseError("Already saved");
      return;
    }

    setBaseUrls([...baseUrls, value]);
    setActiveBase(value);
    setNewBase("");
    setBaseError("");
  }

  // delete a base url
  function deleteBase(target: string): void {
    setBaseUrls(baseUrls.filter((b) => b !== target));

    if (activeBase === target) setActiveBase(null);
  }

  async function send(): Promise<void> {
    setLoading(true);
    setOutput("");

    const finalUrl: string = buildUrl(activeBase, url);

    // get the time in ms
    const start: number = performance.now();

    // fetch url
    try {
      const init: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
      };

      // GET can't have a body
      if (method !== "GET") init.body = body;

      const res: Response = await fetch(finalUrl, init);

      // count the time in ms
      const time: number = Math.round(performance.now() - start);

      // get the response
      const text: string = await res.text();

      let pretty: string = text;

      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch { }

      setOutput(`${finalUrl}\n${res.status} ${res.statusText} · ${time}ms\n\n${pretty}`);

    } catch (err: unknown) {
      setOutput("Error: " + String(err));

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 md:flex-row">
        {/* main area */}
        <div className="min-w-0 flex-1 space-y-3">
          <h1 className="text-xl font-semibold">useFetch</h1>

          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setMethod(e.target.value as Method)
              }
              className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-2 text-sm outline-none"
            >
              {METHODS.map((m: Method) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
              placeholder="/path or full url"
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

          <p className="truncate text-xs text-neutral-500">
            {buildUrl(activeBase, url) || "No url"}
          </p>

          <textarea
            value={body}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
            spellCheck={false}
            placeholder="JSON body"
            className="h-40 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900 p-3 font-mono text-sm outline-none focus:border-neutral-600"
          />

          <pre className="min-h-40 overflow-auto whitespace-pre-wrap break-words rounded-md border border-neutral-800 bg-neutral-900 p-3 font-mono text-sm text-neutral-300">
            {output || "Response will show here"}
          </pre>
        </div>

        {/* base url sidebar (right) */}
        <aside className="w-full shrink-0 space-y-3 md:w-64">
          <h2 className="text-sm font-semibold text-neutral-400">Base URLs</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={newBase}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setNewBase(e.target.value);
                setBaseError("");
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") addBase();
              }}
              placeholder="https://api.example.com"
              className="min-w-0 flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            />
            <button
              onClick={addBase}
              className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950"
            >
              Add
            </button>
          </div>

          {baseError && <p className="text-xs text-red-400">{baseError}</p>}

          <ul className="space-y-1">
            {baseUrls.length === 0 && (
              <li className="text-xs text-neutral-500">No base urls saved</li>
            )}

            {baseUrls.map((b: string) => {
              const active: boolean = b === activeBase;
              return (
                <li
                  key={b}
                  className={`flex items-center gap-2 rounded-md border px-2 py-2 text-sm ${active
                      ? "border-neutral-500 bg-neutral-800"
                      : "border-neutral-800 bg-neutral-900"
                    }`}
                >
                  <button
                    onClick={() => setActiveBase(active ? null : b)}
                    className="min-w-0 flex-1 truncate text-left"
                    title={b}
                  >
                    {b}
                  </button>
                  <button
                    onClick={() => deleteBase(b)}
                    aria-label={`Delete ${b}`}
                    className="text-neutral-500 hover:text-red-400"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </main>
  );
}
