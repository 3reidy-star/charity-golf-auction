import { test } from "node:test";
import assert from "node:assert/strict";
import { DRAW_DURATION_MS, remainingDrawTime } from "../app/breakfast/timing";
test("reveal lasts fifteen seconds including server response time", () => {
  assert.equal(DRAW_DURATION_MS,15_000);
  assert.equal(remainingDrawTime(1000,1000),15_000);
  assert.equal(remainingDrawTime(1000,3000),13_000);
  assert.equal(remainingDrawTime(1000,15999),1);
  assert.equal(remainingDrawTime(1000,16000),0);
  assert.equal(remainingDrawTime(1000,40000),0);
});
