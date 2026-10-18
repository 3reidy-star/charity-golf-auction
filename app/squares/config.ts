export const BOARDS = [
  { id: "two-pound", title: "£2 board", pricePence: 200 },
  { id: "ten-pound", title: "£10 board", pricePence: 1000 },
] as const;
export const ROWS = "ABCDEFGHIJK".split("");
export const CODES = ROWS.flatMap(row => Array.from({ length: 13 }, (_, i) => `${row}${i + 1}`));
export function getBoard(id: string) { return BOARDS.find(board => board.id === id); }
export function validateSelection(boardId: unknown, squares: unknown, name: unknown) {
  const board = typeof boardId === "string" ? getBoard(boardId) : undefined;
  if (!board || !Array.isArray(squares) || squares.length < 1 || squares.length > 20 ||
      squares.some(code => typeof code !== "string" || !CODES.includes(code)) ||
      new Set(squares).size !== squares.length) throw new Error("Choose between 1 and 20 available squares on one board.");
  if (typeof name !== "string" || !name.trim() || name.trim().length > 60) throw new Error("Enter your name (up to 60 characters).");
  return { board, squares: squares as string[], buyerName: name.trim(), amountPence: squares.length * board.pricePence };
}
