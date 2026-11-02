import { test } from "node:test";
import assert from "node:assert/strict";
import type { Prisma } from "@prisma/client";
import { closeSquareBoards } from "../app/squares/lib/close-boards";

test("both boards close under checkout locks while preserving announced winners", async () => {
  const events: string[] = [];
  const settings = new Map<string, { closed: boolean; winningSquare?: string }>([["two-pound", { closed: false, winningSquare: "A1" }]]);
  const tx = {
    $executeRaw: async (_sql: TemplateStringsArray, id: string) => { events.push(`lock:${id}`); return 1; },
    squareBoard: { upsert: async ({where, create, update}: {where:{id:string};create:{id:string;closed:boolean};update:{closed:boolean}}) => {
      events.push(`close:${where.id}`);
      assert.deepEqual(update, {closed:true});
      settings.set(where.id, settings.has(where.id) ? {...settings.get(where.id)!, ...update} : create);
    } },
  } as unknown as Pick<Prisma.TransactionClient, "$executeRaw" | "squareBoard">;
  await closeSquareBoards(tx);
  assert.deepEqual(events,["lock:ten-pound","close:ten-pound","lock:two-pound","close:two-pound"]);
  assert.equal(settings.get("ten-pound")?.closed,true);
  assert.deepEqual(settings.get("two-pound"),{closed:true,winningSquare:"A1"});
  await closeSquareBoards(tx);
  assert.equal(settings.get("two-pound")?.winningSquare,"A1");
});
