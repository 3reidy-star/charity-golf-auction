export type BreakfastStatus = { receiptReceived: boolean };
// Handing in the receipt is the confirmation that breakfast was paid for.
export function isEligibleForBreakfastDraw(entry: BreakfastStatus) {
  return entry.receiptReceived;
}
export function changeBreakfastStatus(field: string, checked: boolean): BreakfastStatus {
  if (field !== "receiptReceived") throw new Error("Refresh the guest list and use the Receipt received checkbox.");
  return { receiptReceived: checked };
}
