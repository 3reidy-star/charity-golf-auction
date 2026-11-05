import { test } from "node:test";
import assert from "node:assert/strict";
import { changeBreakfastStatus, isEligibleForBreakfastDraw } from "../app/breakfast/eligibility";
import { selectOne } from "../app/breakfast/draw";

test("a guest needs both their own breakfast paid and a receipt to qualify", () => {
  assert.equal(isEligibleForBreakfastDraw({paidOwnBreakfast:false,receiptReceived:false}),false);
  assert.equal(isEligibleForBreakfastDraw({paidOwnBreakfast:true,receiptReceived:false}),false);
  assert.equal(isEligibleForBreakfastDraw({paidOwnBreakfast:false,receiptReceived:true}),false);
  assert.equal(isEligibleForBreakfastDraw({paidOwnBreakfast:true,receiptReceived:true}),true);
});

test("receipt cannot be confirmed before payment and removing payment clears receipt", () => {
  const unconfirmed = {paidOwnBreakfast:false,receiptReceived:false};
  assert.throws(()=>changeBreakfastStatus(unconfirmed,"receiptReceived",true),/paid for own breakfast/);
  const paid = changeBreakfastStatus(unconfirmed,"paidOwnBreakfast",true);
  assert.deepEqual(paid,{paidOwnBreakfast:true,receiptReceived:false});
  const entered = changeBreakfastStatus(paid,"receiptReceived",true);
  assert.deepEqual(entered,{paidOwnBreakfast:true,receiptReceived:true});
  assert.deepEqual(changeBreakfastStatus(entered,"paidOwnBreakfast",false),unconfirmed);
  assert.deepEqual(changeBreakfastStatus(entered,"receiptReceived",false),paid);
  assert.throws(()=>changeBreakfastStatus(entered,"other",true),/Unknown/);
});

test("unconfirmed and paid-without-receipt guests cannot win", () => {
  const entries = [
    {name:"Not paid",paidOwnBreakfast:false,receiptReceived:false},
    {name:"No receipt",paidOwnBreakfast:true,receiptReceived:false},
    {name:"Ready",paidOwnBreakfast:true,receiptReceived:true},
  ];
  const winners=selectOne(entries.filter(isEligibleForBreakfastDraw));
  assert.equal(winners.length,1);
  assert.equal(winners[0].name,"Ready");
  assert.throws(()=>selectOne(entries.slice(0,2).filter(isEligibleForBreakfastDraw)),/at least one eligible/);
});
