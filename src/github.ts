import { Octokit } from "@octokit/rest";

let client: Octokit | null = null;

export function getClient(): Octokit {
  if (client) return client;
  // Works without a token (60 req/hr) or with one (5000 req/hr)
  client = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
    userAgent: "mcp-github/1.0.0",
  });
  return client;
}

// Strip nulls and keep only plain serialisable data
export function clean(obj: unknown): unknown {
  if (obj === null || obj === undefined) return undefined;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(clean);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v !== null && v !== undefined) out[k] = clean(v);
  }
  return out;
}
