import { test } from "node:test";
import assert from "node:assert/strict";
import { CODES, validateSelection } from "../app/squares/config";
import { verifiedOutcome, checkoutUrl } from "../app/squares/lib/sumup";

test("boards have the reference grid and different server-side prices",()=>{
 assert.equal(CODES.length,143);assert.equal(CODES[0],"A1");assert.equal(CODES.at(-1),"K13");
 assert.equal(validateSelection("two-pound",["A1","K13"],"Craig").amountPence,400);
 assert.equal(validateSelection("ten-pound",["A1","K13"],"Craig").amountPence,2000);
});
test("invalid or duplicate selections and empty names are rejected",()=>{
 for(const squares of [[],["A1","A1"],["L1"],[1],CODES.slice(0,21)])assert.throws(()=>validateSelection("two-pound",squares,"Craig"));
 assert.throws(()=>validateSelection("cheap",["A1"],"Craig"));
 assert.throws(()=>validateSelection("two-pound",["A1"]," "));
});
const order={id:"reservation",amountPence:400};
process.env.SUMUP_MERCHANT_CODE="club";
const checkout={id:"checkout",checkout_reference:"reservation",amount:4,currency:"GBP",merchant_code:"club",status:"PAID"};
test("only matched SumUp payments settle a purchase",()=>{
 assert.equal(verifiedOutcome(checkout,order),"PAID");
 for(const change of [{amount:2},{currency:"EUR"},{merchant_code:"other"},{checkout_reference:"other"}])assert.throws(()=>verifiedOutcome({...checkout,...change},order));
});
test("failed and pending checkouts retain claims; only confirmed expiry releases",()=>{
 for(const status of ["PENDING","FAILED","UNKNOWN"])assert.equal(verifiedOutcome({...checkout,status},order),"PENDING");
 assert.equal(verifiedOutcome({...checkout,status:"EXPIRED"},order),"EXPIRED");
});
test("redirects only use secure SumUp hosted checkout",()=>{
 assert.equal(checkoutUrl({...checkout,hosted_checkout_url:"https://checkout.sumup.com/pay/test"}),"https://checkout.sumup.com/pay/test");
 for(const url of ["https://example.com","http://checkout.sumup.com/pay/test","https://checkout.sumup.com.evil.example/",undefined])assert.throws(()=>checkoutUrl({...checkout,hosted_checkout_url:url}));
});
