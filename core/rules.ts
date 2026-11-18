// The rules of the game. There is no clock here: a command updates the state at
// once, and the events it returns are a record of what happened. Whoever called
// apply() decides how, or whether, to show them over time.
import { RECIPES, WIN_ITEM } from "./recipes.ts";

import {
  isPassable,
  type Terrain,
  TERRAIN_YIELDS,
  terrainAt,
} from "./terrain.ts";

export type Cell = { x: number; y: number };

export type Direction = "north" | "south" | "east" | "west";

// Plain data that survives JSON. Terrain is absent because the seed can recompute
// it: besides the seed, only what the player has caused belongs here.
export type GameState = {
  seed: number;
  player: Cell;
  inventory: Record<string, number>;
  changedCells: Record<string, Terrain>;
  won: boolean;
};

// Command: https://gameprogrammingpatterns.com/command.html
export type Command =
  | { type: "move"; direction: Direction }
  | { type: "gather" }
  | { type: "craft"; item: string };

// Domain Event: https://martinfowler.com/eaaDev/DomainEvent.html
export type GameEvent =
  | { type: "moved"; from: Cell; to: Cell }
  | { type: "blocked"; at: Cell; toward: Cell; terrain: Terrain }
  | { type: "gathered"; at: Cell; item: string; terrain: Terrain }
  | { type: "gatherFailed"; at: Cell }
  | { type: "crafted"; item: string; inventory: Record<string, number> }
  | { type: "craftFailed"; item: string; missing: Record<string, number> }
  | { type: "won" };

const STEPS: Record<Direction, Cell> = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

// Singleton, avoided on purpose: tests make as many games as they need. https://gameprogrammingpatterns.com/singleton.html
export function newGame(seed: number): GameState {
  return {
    seed,
    player: { x: 0, y: 0 },
    inventory: {},
    changedCells: {},
    won: false,
  };
}

export function currentTerrain(
  state: GameState,
  x: number,
  y: number,
): Terrain {
  const cell = `${x},${y}`;

  return state.changedCells[cell] ??
    terrainAt(state.seed, x, y);
}

// The single way in. It updates the state it is given and returns the events.
export function apply(state: GameState, command: Command): GameEvent[] {
  if (state.won) return [];
  switch (command.type) {
    case "move":
      return move(state, command.direction);
    case "gather":
      return gather(state);
    case "craft":
      return craft(state, command.item);
  }
}

function move(state: GameState, direction: Direction): GameEvent[] {
  const step = STEPS[direction];
  // Events are retained and played back later, while state keeps changing. So an
  // event gets cells of its own, never an object that state still holds.
  // Aliasing Bug: https://martinfowler.com/bliki/AliasingBug.html
  // Cells in events act as a Value Object: https://martinfowler.com/bliki/ValueObject.html
  const from = { ...state.player };
  const to = { x: from.x + step.x, y: from.y + step.y };
  const terrain = currentTerrain(state, to.x, to.y);
  const hasRaft = (state.inventory["raft"] ?? 0) > 0;

  if (!isPassable(terrain, hasRaft)) {
    return [{ type: "blocked", at: from, toward: to, terrain }];
  }
  state.player.x = to.x;
  state.player.y = to.y;
  return [{ type: "moved", from, to }];
}

function gather(state: GameState): GameEvent[] {
  const at = { ...state.player };
  const cell = `${at.x},${at.y}`;

  const terrain = currentTerrain(state, at.x, at.y);
  const item = TERRAIN_YIELDS[terrain];

  if (item === null) {
    return [{ type: "gatherFailed", at }];
  }
  state.inventory[item] = (state.inventory[item] ?? 0) + 1;
  const newTerrain: Terrain = "grass";
  state.changedCells[cell] = newTerrain;
  return [{ type: "gathered", at, item, terrain: newTerrain }];
}

export function missingMaterials(
  state: GameState,
  item: string,
): Record<string, number> {
  const recipe = RECIPES.find((r) => r.name === item);
  const missing: Record<string, number> = {};

  if (!recipe) return missing;

  for (const material in recipe.needs) {
    const needed = recipe.needs[material];
    const has = state.inventory[material] ?? 0;

    if (has < needed) {
      missing[material] = needed - has;
    }
  }

  return missing;
}

function craft(state: GameState, item: string): GameEvent[] {
  const recipe = RECIPES.find((r) => r.name === item);

  if (!recipe) {
    return [{
      type: "craftFailed",
      item,
      missing: {},
    }];
  }

  const missing = missingMaterials(state, item);

  if (Object.keys(missing).length > 0) {
    return [{
      type: "craftFailed",
      item,
      missing,
    }];
  }

  //use the materials
  for (const material in recipe.needs) {
    state.inventory[material] -= recipe.needs[material];
  }

  state.inventory[item] = (state.inventory[item] ?? 0) + 1; //give the player the new item

  const events: GameEvent[] = [{
    type: "crafted",
    item,
    inventory: { ...state.inventory },
  }];

if (item === WIN_ITEM) {
    state.won = true;
    events.push({ type: "won" });
  }

return events;
}
