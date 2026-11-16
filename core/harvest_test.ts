import { assertEquals } from "@std/assert";
import { apply, currentTerrain } from "./mod.ts";
import { onTerrain } from "./test_helpers.ts";
import { newGame } from "./rules.ts";
import { isPassable, terrainAt } from "./terrain.ts";

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

Deno.test("Crafting raft allows the player to move on rivers", () => {
  const state = newGame(SEED);
  let found = false;
  //move the player until they find a river
  for (let x = 1; x < 100_100; x++) {
    if (
      isPassable(terrainAt(SEED, x, 0)) && terrainAt(SEED, x + 1, 0) === "river"
    ) {
      state.player = { x, y: 0 };
      found = true;
      break;
    }
  }
  if (!found) throw new Error("Could not find a river.");

  state.inventory["wood"] = 3;
  state.inventory["rope"] = 1;

  const blocked = apply(state, {
    type: "move",
    direction: "east",
  });
  //make sure the player can't pass through the river before crafting
  assertEquals(blocked[0].type, "blocked");

  //craft raft
  apply(state, { type: "craft", item: "raft" });
  assertEquals(state.inventory["raft"], 1);

  const moved = apply(state, {
    type: "move",
    direction: "east",
  });

  //make sure the player is able to move onto river after crafting raft
  assertEquals(moved[0].type, "moved");
  assertEquals(state.player, {
    x: state.player.x,
    y: 0,
  });
});
