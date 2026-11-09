import { test } from "node:test";
import assert from "node:assert/strict";
import { ABSTAIN, ROLES, validateBallot } from "../app/voting/config";
import { makeVoterToken, voterHash } from "../app/voting/browser-token";

test("ballot contains exactly the requested candidates for each role", () => {
  assert.deepEqual(ROLES[0].candidates.map(c=>c.name),["Jose Cubides","Joe Andrews","Adrian Baines"]);
  assert.deepEqual(ROLES[1].candidates.map(c=>c.name),["Joe Andrews","Carl Thomas"]);
  assert.deepEqual(validateBallot("joe-andrews","joe-andrews"),{newMembers:"joe-andrews",media:"joe-andrews"});
});

test("wrong-role candidates and invalid or missing choices are rejected", () => {
  for (const value of [null,undefined,"","carl-thomas","jose-cubides<script>",{},["jose-cubides"]]) assert.throws(()=>validateBallot(value,"joe-andrews"));
  for (const value of [null,"","jose-cubides","adrian-baines"]) assert.throws(()=>validateBallot("jose-cubides",value));
  assert.throws(()=>validateBallot(ABSTAIN,ABSTAIN));
  assert.deepEqual(validateBallot(ABSTAIN,"carl-thomas"),{newMembers:ABSTAIN,media:"carl-thomas"});
  assert.deepEqual(validateBallot("adrian-baines",ABSTAIN),{newMembers:"adrian-baines",media:ABSTAIN});
});

test("browser tokens are stable when reused and cannot be forged or tampered with", () => {
  const secret="test-only-committee-secret",token=makeVoterToken(secret),hash=voterHash(token,secret);
  assert.ok(hash);
  assert.equal(voterHash(token,secret),hash);
  assert.notEqual(voterHash(makeVoterToken(secret),secret),hash);
  assert.equal(voterHash(token,"wrong-secret"),null);
  assert.equal(voterHash(token,""),null);
  assert.equal(voterHash(undefined,secret),null);
  assert.equal(voterHash("not-a-token",secret),null);
  const [id,signature]=token.split(".");
  assert.equal(voterHash(`${id}.${signature[0]==="a"?"b":"a"}${signature.slice(1)}`,secret),null);
});
