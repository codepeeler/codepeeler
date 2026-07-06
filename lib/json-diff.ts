export type DiffEntry = {
  path: string;
  kind: "added" | "removed" | "changed";
  left?: unknown;
  right?: unknown;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function deepDiff(a: unknown, b: unknown, path = "$"): DiffEntry[] {
  const out: DiffEntry[] = [];

  if (Array.isArray(a) && Array.isArray(b)) {
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) out.push({ path: p, kind: "added", right: b[i] });
      else if (i >= b.length) out.push({ path: p, kind: "removed", left: a[i] });
      else out.push(...deepDiff(a[i], b[i], p));
    }
    return out;
  }

  if (isObject(a) && isObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      const p = `${path}.${key}`;
      const hasA = key in a;
      const hasB = key in b;
      if (!hasA) out.push({ path: p, kind: "added", right: b[key] });
      else if (!hasB) out.push({ path: p, kind: "removed", left: a[key] });
      else out.push(...deepDiff(a[key], b[key], p));
    }
    return out;
  }

  const same = JSON.stringify(a) === JSON.stringify(b);
  if (!same) out.push({ path, kind: "changed", left: a, right: b });
  return out;
}
