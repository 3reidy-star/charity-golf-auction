export const DRAW_DURATION_MS = 15_000;
export function remainingDrawTime(startedAt: number, now: number) {
  return Math.max(0, DRAW_DURATION_MS - Math.max(0, now - startedAt));
}
