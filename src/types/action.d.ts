export type ActionResultType<T = unknown> =
  | { ok: true; data: T; redirect?: string }
  | { ok: false; code?: number; type: string; message: string; details?: unknown };
