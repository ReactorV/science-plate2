/**
 * Deterministic canonical JSON serialisation + SHA-256 hash.
 * Guarantees byte-identical output for the same input regardless of key insertion order.
 */

function canonicalStringify(obj: unknown): string {
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
  if (typeof obj === "string") return JSON.stringify(obj);

  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalStringify).join(",") + "]";
  }

  if (typeof obj === "object") {
    const keys = Object.keys(obj as Record<string, unknown>).sort();
    const pairs = keys.map(
      (k) => JSON.stringify(k) + ":" + canonicalStringify((obj as Record<string, unknown>)[k]),
    );
    return "{" + pairs.join(",") + "}";
  }

  return String(obj);
}

export async function computeHash(input: unknown): Promise<string> {
  const canonical = canonicalStringify(input);
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export { canonicalStringify };
