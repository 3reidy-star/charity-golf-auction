export type BreakfastStatus = { paidOwnBreakfast: boolean; receiptReceived: boolean };
export function isEligibleForBreakfastDraw(entry: BreakfastStatus) {
  return entry.paidOwnBreakfast && entry.receiptReceived;
}
export function changeBreakfastStatus(current: BreakfastStatus, field: string, checked: boolean): BreakfastStatus {
  if (field === "paidOwnBreakfast") return { paidOwnBreakfast: checked, receiptReceived: checked && current.receiptReceived };
  if (field === "receiptReceived") {
    if (checked && !current.paidOwnBreakfast) throw new Error("Tick paid for own breakfast before marking the receipt as received.");
    return { paidOwnBreakfast: current.paidOwnBreakfast, receiptReceived: checked };
  }
  throw new Error("Unknown breakfast checklist field.");
}
