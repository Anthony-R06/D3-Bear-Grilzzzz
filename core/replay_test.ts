import { assertEquals } from "@std/assert";
import { apply, type Command, type GameEvent, newGame } from "./mod.ts";
import run from "./run.json" with { type: "json" };

function play() {
  const state = newGame(run.seed);
  const events: GameEvent[] = [];

  const commands = run.commands as Command[];

  for (const command of commands) {
    events.push(...apply(state, command));
  }

  return { state, events };
}

Deno.test("recorded run reaches the ending", () => {
  const result = play();

  assertEquals(result.state.won, true);
});

Deno.test("recorded run is deterministic", () => {
  const first = play();

  // Let the clock tick, so that a stored timestamp cannot match by luck.
  const start = Date.now();
  while (Date.now() === start);

  const second = play();

  assertEquals(first, second);
});
