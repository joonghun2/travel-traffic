// Feature switches (no imports, so client components can read them cheaply).

/**
 * Off while the cameras' stream server (59.8.86.15:1935, used by all 23 Jeju viewers) is unreachable:
 * every viewer showed a black screen (checked 2026-10-22). Turn back on once the streams play again.
 * Hides the map chip, the /jeju/cctv page and the per-spot camera links.
 */
export const JEJU_CCTV_ENABLED = false;
