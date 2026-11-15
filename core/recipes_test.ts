import { assertEquals } from "@std/assert";
import { apply, newGame } from "./mod.ts";

Deno.test("crafting rope works with enough wood", () => {
  const state = newGame(121);
  state.inventory["wood"] = 2;

  const events = apply(state, { type: "craft", item: "rope" });

  assertEquals(state.inventory["wood"], 0);
  assertEquals(state.inventory["rope"], 1);
  assertEquals(events[0].type, "crafted");
});

Deno.test("crafting fails without enough wood", () => {
  const state = newGame(121);
  const before = JSON.parse(JSON.stringify(state));

  const events = apply(state, { type: "craft", item: "rope" });

  assertEquals(state, before);
  assertEquals(events[0].type, "craftFailed");
});

Deno.test("crafting a raft uses wood and rope", () => {
  const state = newGame(121);
  state.inventory["wood"] = 3;
  state.inventory["rope"] = 1;

  apply(state, { type: "craft", item: "raft" });

  assertEquals(state.inventory["wood"], 0);
  assertEquals(state.inventory["rope"], 0);
  assertEquals(state.inventory["raft"], 1);
});
