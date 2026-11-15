import {
  type GameEvent,
  type GameState,
  type Terrain,
  terrainAt,
} from "../core/mod.ts";

function element(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function describe(event: GameEvent): string {
  switch (event.type) {
    case "moved":
      return `moved to ${event.to.x}, ${event.to.y}`;
    case "blocked":
      return `blocked by ${event.terrain} at ${event.toward.x}, ${event.toward.y}`;
    case "gathered":
      return `gathered ${event.item} at ${event.at.x}, ${event.at.y}`;
    case "gatherFailed":
      return `nothing to gather at ${event.at.x}, ${event.at.y}`;
  }
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
  private readonly seed: number;
  private readonly changedCells: Record<string, Terrain>;

  constructor(state: GameState) {
    this.seed = state.seed;
    this.changedCells = { ...state.changedCells };
    this.showPosition(state.player.x, state.player.y);
  }

  show(event: GameEvent) {
    element("live").textContent = describe(event);
    if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
    if (event.type === "gathered") {
      const cell = `${event.at.x},${event.at.y}`;
      this.changedCells[cell] = event.terrain;
      this.showPosition(event.at.x, event.at.y);
    }
  }

  private showPosition(x: number, y: number) {
    element("position").textContent = `${x}, ${y}`;

    const cell = `${x},${y}`;

    element("terrain").textContent = this.changedCells[cell] ??
      terrainAt(this.seed, x, y);
  }
}
