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

  private readonly inventory = new Map<
    string,
    {
      row: HTMLDivElement;
      count: HTMLSpanElement;
    }
  >();

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
      this.showGathered(event.item);
    }
  }

  private showGathered(item: string) {
    const container = element("inventory-items");

    let entry = this.inventory.get(item);

    //if the player has not picked up the item before
    if (!entry) {
      element("inventory-empty").remove();

      const row = document.createElement("div");
      row.className = "inventory-item";
      row.dataset.item = item;

      const icon = document.createElement("span");
      icon.className = "inventory-icon";
      //add in more icons later
      icon.textContent = "🪵";

      const name = document.createElement("span");
      name.className = "inventory-name";
      name.textContent = item;

      const count = document.createElement("span");
      count.className = "inventory-count";
      count.textContent = "1";

      row.append(icon, name, count);
      container.append(row);

      entry = { row, count };
      this.inventory.set(item, entry);
      //if the player has picked up the item, increase the item count by 1
    } else {
      entry.count.textContent = String(Number(entry.count.textContent) + 1);
    }
  }

  private showPosition(x: number, y: number) {
    element("position").textContent = `${x}, ${y}`;

    const cell = `${x},${y}`;

    element("terrain").textContent = this.changedCells[cell] ??
      terrainAt(this.seed, x, y);
  }
}
