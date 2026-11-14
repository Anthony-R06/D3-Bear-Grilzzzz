import { type GameState, newGame, type Terrain, terrainAt } from "./mod.ts";

export function onTerrain(
  seed: number,
  terrain: Terrain,
): GameState {
  for (let x = 2; x < 10_000; x++) {
    if (terrainAt(seed, x, 0) === terrain) {
      const state = newGame(seed);
      state.player = { x, y: 0 };
      return state;
    }
  }

  throw new Error("Found no suitable terrain on this row.");
}
