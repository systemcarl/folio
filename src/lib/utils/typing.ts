export function tryGet<T = unknown>(
  obj : unknown,
  path : string,
  predicate : (value : unknown) => value is T,
) : T | undefined {
  if (typeof obj !== 'object' || obj === null) return undefined;

  path = path.startsWith('.') ? path.slice(1) : path;
  const first = path.split('.')[0];
  if (!first) return undefined;
  const remaining = path.slice(first.length);

  let next : unknown;
  try {
    next = (obj as Record<string, unknown>)[first];
  } catch {
    return undefined;
  }
  if (next === undefined) return next;

  if (!remaining) {
    if (predicate(next)) return next;
    return undefined;
  }

  return tryGet(next, remaining, predicate);
}
