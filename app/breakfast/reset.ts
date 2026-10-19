export function validateBreakfastReset(confirmation: unknown, expectedDrawnAt: unknown, drawnAt: Date | null) {
  if (confirmation !== "RESET") throw new Error("Type RESET to confirm.");
  if (String(expectedDrawnAt ?? "") !== (drawnAt?.toISOString() ?? "")) throw new Error("The draw changed in another window. Refresh before resetting it.");
}
