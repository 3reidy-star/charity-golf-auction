import { test } from "node:test";
import assert from "node:assert/strict";
import { validateBreakfastReset } from "../app/breakfast/reset";
import { parseNames, selectThree } from "../app/breakfast/draw";

test("paid names are normalised and duplicate guests rejected", () => {
  assert.deepEqual(parseNames(" Craig   Reid \r\n\nTim Smith\n"), [ { name: "Craig Reid", nameKey: "craig reid" }, { name: "Tim Smith", nameKey: "tim smith" } ]);
  assert.throws(() => parseNames("Craig Reid\ncraig reid"), /more than once/);
  assert.throws(() => parseNames("Ｃｒａｉｇ\nCraig"), /more than once/);
  assert.throws(() => parseNames("  "));
  assert.throws(() => parseNames("a".repeat(101)));
  assert.throws(() => parseNames(Array.from({ length: 201 }, (_, i) => `Guest ${i}`).join("\n")));
});

test("draw requires at least three guests and leaves the list unchanged", () => {
  assert.throws(() => selectThree([]), /at least three/);
  assert.throws(() => selectThree(["A", "B"]), /at least three/);
  const entries = ["A", "B", "C"];
  assert.deepEqual(selectThree(entries, () => 0), entries);
  assert.deepEqual(entries, ["A", "B", "C"]);
});

test("every ordered selection from four guests is equally reachable without repeats", () => {
  const outcomes = new Set<string>();
  for (let a = 0; a < 4; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 2; c++) {
    const picks = [a, b, c], bounds: number[] = [];
    const winners = selectThree(["A", "B", "C", "D"], max => { bounds.push(max); return picks.shift()!; });
    assert.deepEqual(bounds, [4, 3, 2]);
    assert.equal(new Set(winners).size, 3);
    outcomes.add(winners.join(""));
  }
  assert.equal(outcomes.size, 24);
});

test("the production random source returns three distinct entrants", () => {
  const entries = Array.from({ length: 100 }, (_, id) => ({ id }));
  const winners = selectThree(entries);
  assert.equal(winners.length, 3);
  assert.equal(new Set(winners.map(e => e.id)).size, 3);
  assert.ok(winners.every(w => entries.includes(w)));
});


test("reset requires deliberate confirmation and cannot clear a newer draw", () => {
  const drawnAt = new Date("2026-10-19T17:00:00Z");
  for (const confirmation of [null, "", "reset", "YES"]) assert.throws(() => validateBreakfastReset(confirmation, drawnAt.toISOString(), drawnAt), /Type RESET/);
  assert.throws(() => validateBreakfastReset("RESET", "", drawnAt), /changed in another window/);
  assert.throws(() => validateBreakfastReset("RESET", "2026-10-19T16:00:00.000Z", drawnAt), /changed in another window/);
  assert.doesNotThrow(() => validateBreakfastReset("RESET", drawnAt.toISOString(), drawnAt));
  assert.doesNotThrow(() => validateBreakfastReset("RESET", "", null));
});
