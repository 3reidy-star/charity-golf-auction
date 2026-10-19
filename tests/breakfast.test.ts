import { test } from "node:test";
import assert from "node:assert/strict";
import { validateBreakfastReset } from "../app/breakfast/reset";
import { parseNames, selectOne } from "../app/breakfast/draw";

test("paid names are normalised and duplicate guests rejected", () => {
  assert.deepEqual(parseNames(" Craig   Reid \r\n\nTim Smith\n"), [ { name: "Craig Reid", nameKey: "craig reid" }, { name: "Tim Smith", nameKey: "tim smith" } ]);
  assert.throws(() => parseNames("Craig Reid\ncraig reid"), /more than once/);
  assert.throws(() => parseNames("Ｃｒａｉｇ\nCraig"), /more than once/);
  assert.throws(() => parseNames("  "));
  assert.throws(() => parseNames("a".repeat(101)));
  assert.throws(() => parseNames(Array.from({ length: 201 }, (_, i) => `Guest ${i}`).join("\n")));
});

test("draw requires a guest and leaves the list unchanged", () => {
  assert.throws(() => selectOne([]), /at least one/);
  assert.deepEqual(selectOne(["Only Guest"]), ["Only Guest"]);
  const entries = ["A", "B", "C"];
  assert.deepEqual(selectOne(entries, () => 1), ["B"]);
  assert.deepEqual(entries, ["A", "B", "C"]);
});

test("every guest is equally reachable as the single winner", () => {
  const entries = ["A", "B", "C", "D"];
  const outcomes = new Set<string>();
  for (let index = 0; index < entries.length; index++) {
    const winners = selectOne(entries, max => { assert.equal(max, entries.length); return index; });
    assert.equal(winners.length, 1);
    outcomes.add(winners[0]);
  }
  assert.deepEqual(outcomes, new Set(entries));
});

test("the production random source returns exactly one entrant", () => {
  const entries = Array.from({ length: 100 }, (_, id) => ({ id }));
  const winners = selectOne(entries);
  assert.equal(winners.length, 1);
  assert.ok(entries.includes(winners[0]));
});

test("reset requires deliberate confirmation and cannot clear a newer draw", () => {
  const drawnAt = new Date("2026-10-19T17:00:00Z");
  for (const confirmation of [null, "", "reset", "YES"]) assert.throws(() => validateBreakfastReset(confirmation, drawnAt.toISOString(), drawnAt), /Type RESET/);
  assert.throws(() => validateBreakfastReset("RESET", "", drawnAt), /changed in another window/);
  assert.throws(() => validateBreakfastReset("RESET", "2026-10-19T16:00:00.000Z", drawnAt), /changed in another window/);
  assert.doesNotThrow(() => validateBreakfastReset("RESET", drawnAt.toISOString(), drawnAt));
  assert.doesNotThrow(() => validateBreakfastReset("RESET", "", null));
});
