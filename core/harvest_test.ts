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
    terrain: "grass",
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

Deno.test("gather event stays the same", () => {
  const state = onTerrain(SEED, "jungle");
  const events = apply(state, { type: "gather" }); //pick up wood
  const saved = JSON.parse(JSON.stringify(events)); //save the original event
  apply(state, { type: "gather" }); //try picking up again
  assertEquals(events, saved); //the first event should still be the same
});
