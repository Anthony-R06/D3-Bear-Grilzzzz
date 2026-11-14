import { assertEquals } from "@std/assert";
import { apply, currentTerrain } from "./mod.ts";
import { onTerrain } from "./test_helpers.ts";

const SEED = 121;

Deno.test("gathering from jungle adds wood to inventory", () => {
  const state = onTerrain(SEED, "jungle");
  const at = { ...state.player };

  const events = apply(state, { type: "gather" });

  assertEquals(state.inventory["wood"], 1);

  assertEquals(currentTerrain(state, at.x, at.y), "grass");

  assertEquals(events, [{
    type: "gathered",
    at,
    item: "wood",
  }]);
});

Deno.test("gathering from grass changes nothing", () => {
  const state = onTerrain(SEED, "grass");
  const snapshot = JSON.parse(JSON.stringify(state));
  const at = { ...state.player };

  const events = apply(state, { type: "gather" });

  assertEquals(state, snapshot);

  assertEquals(events, [{
    type: "gatherFailed",
    at,
  }]);
});

Deno.test("a cell cannot be gathered twice", () => {
  const state = onTerrain(SEED, "jungle");
  const at = { ...state.player };

  apply(state, { type: "gather" });

  const snapshot = JSON.parse(JSON.stringify(state));

  const events = apply(state, { type: "gather" });

  assertEquals(state, snapshot);
  assertEquals(state.inventory["wood"], 1);

  assertEquals(events, [{
    type: "gatherFailed",
    at,
  }]);
});
