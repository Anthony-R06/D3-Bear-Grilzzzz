import { missingMaterials, RECIPES } from "../core/mod.ts";
import type { GameState } from "../core/mod.ts";

export class RecipeBook {
  private buttons: HTMLButtonElement[] = [];

  constructor(
    private list: HTMLElement,
    private state: GameState,
    private craft: (item: string) => void,
  ) {
    for (const recipe of RECIPES) {
      const row = document.createElement("li");
      const button = document.createElement("button");

      button.type = "button";
      button.textContent = recipe.name;

      button.addEventListener("click", (event) => {
        this.craft(recipe.name);

        // Give the arrow keys back after a mouse click
        if (event.detail > 0) button.blur();
      });

      row.append(button);
      this.list.append(row);
      this.buttons.push(button);
    }
  }

  update() {
    for (let i = 0; i < RECIPES.length; i++) {
      const recipe = RECIPES[i];
      const missing = missingMaterials(this.state, recipe.name);

      if (Object.keys(missing).length === 0) {
        this.buttons[i].textContent = `Craft ${recipe.name} (Ready)`;
      } else {
        const materials = Object.entries(missing)
          .map(([item, count]) => `${count} ${item}`)
          .join(", ");

        this.buttons[i].textContent =
          `Craft ${recipe.name} (Need ${materials})`;
      }
    }
  }
}
