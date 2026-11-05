import { test } from "node:test";
import assert from "node:assert/strict";
import { changeBreakfastStatus, isEligibleForBreakfastDraw } from "../app/breakfast/eligibility";
import { selectOne } from "../app/breakfast/draw";

test("receipt received alone confirms payment and draw eligibility", () => {
  assert.equal(isEligibleForBreakfastDraw({receiptReceived:false}),false);
  assert.equal(isEligibleForBreakfastDraw({receiptReceived:true}),true);
  // Legacy payment flags must not prevent a receipted guest from entering.
  const legacy = {paidOwnBreakfast:false,receiptReceived:true};
  assert.equal(isEligibleForBreakfastDraw(legacy),true);
});

test("the single receipt tick adds or removes draw eligibility", () => {
  assert.deepEqual(changeBreakfastStatus("receiptReceived",true),{receiptReceived:true});
  assert.deepEqual(changeBreakfastStatus("receiptReceived",false),{receiptReceived:false});
  assert.throws(()=>changeBreakfastStatus("paidOwnBreakfast",true),/Refresh/);
});

test("only guests who handed in receipts can win", () => {
  const entries = [ {name:"No receipt",receiptReceived:false}, {name:"Ready",receiptReceived:true} ];
  const winners = selectOne(entries.filter(isEligibleForBreakfastDraw));
  assert.equal(winners.length,1);
  assert.equal(winners[0].name,"Ready");
  assert.throws(()=>selectOne(entries.slice(0,1).filter(isEligibleForBreakfastDraw)),/at least one eligible/);
});
