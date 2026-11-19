import { assertEquals } from "@std/assert";
import { apply, newGame, RECIPES, WIN_ITEM } from "./mod.ts";
import { winCell } from "./rules.ts";

Deno.test("final recipe wins and stops later commands", () => {
  const state = newGame(121);

  state.player = { ...winCell };

  const recipe = RECIPES.find((r) => r.name === WIN_ITEM)!;

  for (const [item, count] of Object.entries(recipe.needs)) {
    state.inventory[item] = count;
  }

  const events = apply(state, {
    type: "craft",
    item: WIN_ITEM,
  });

  assertEquals(
    events.map((event) => event.type),
    ["crafted", "won"],
  );
  assertEquals(state.won, true);

  const before = JSON.parse(JSON.stringify(state));

  const commands = [
    { type: "move", direction: "east" },
    { type: "gather" },
    { type: "craft", item: "rope" },
  ] as const;

  for (const command of commands) {
    assertEquals(apply(state, command), []);
    assertEquals(state, before);
  }
});

Deno.test("crafting rescue signal away from win cell does not win", () => {
  const state = newGame(121);
  const recipe = RECIPES.find((r) => r.name === WIN_ITEM)!;

  for (const [item, count] of Object.entries(recipe.needs)) {
    state.inventory[item] = count;
  }

  const events = apply(state, {
    type: "craft",
    item: WIN_ITEM,
  });

  assertEquals(
    events.map((event) => event.type),
    ["crafted"],
  );

  assertEquals(state.won, false);
  assertEquals(state.inventory[WIN_ITEM], 1);
});

Deno.test("cannot win without materials", () => {
  const state = newGame(121);
  state.player = { ...winCell };
  const before = JSON.parse(JSON.stringify(state));

  const events = apply(state, {
    type: "craft",
    item: WIN_ITEM,
  });

  assertEquals(events[0].type, "craftFailed");
  assertEquals(state, before);
});
