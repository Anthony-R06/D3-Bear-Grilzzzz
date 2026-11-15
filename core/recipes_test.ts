import { assertEquals } from "@std/assert";
import { apply, newGame } from "./mod.ts";
import { RECIPES, TERRAIN_YIELDS } from "./mod.ts";

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

Deno.test("every recipe ingredient has a source", () => {
  const available = new Set<string>();

  for (const item of Object.values(TERRAIN_YIELDS)) { //items we can collect from the map
    if (item !== null) {
      available.add(item);
    }
  }

  for (const recipe of RECIPES) { //items we can make from recipes
    available.add(recipe.name);
  }

  for (const recipe of RECIPES) { //check every ingredient
    for (const item of Object.keys(recipe.needs)) {
      if (!available.has(item)) {
        throw new Error(`${item} has no source`);
      }
    }
  }
});
