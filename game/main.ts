import { newGame } from "../core/mod.ts";
import { Controller } from "./controller.ts";
import { startGridView } from "./grid/grid_view.ts";
import { Hud } from "./hud.ts";
import { Presenter } from "./presenter.ts";
import { Sounds } from "./sounds.ts";
import { RecipeBook } from "./recipe_book.ts";

// Where everything is wired together, and the only file that knows every part.
// Hexagonal Architecture (the core inside; keys, grid, HUD, sound, and tests around
// it): https://alistair.cockburn.us/hexagonal-architecture

// Choose another world with a URL like ?seed=7
const seed = Number(new URLSearchParams(location.search).get("seed")) || 121;

const state = newGame(seed);
const hud = new Hud(state);
const sounds = new Sounds(
  document.getElementById("mute") as HTMLButtonElement,
);
const grid = await startGridView(document.getElementById("grid")!, state);
const presenter = new Presenter([grid, hud, sounds]);
const controller = new Controller(state, presenter);
const recipeList = document.getElementById("recipe-list")!; //set up the crafting menu

const recipeBook = new RecipeBook(
  recipeList,
  state,
  (item) => controller.craftItem(item),
);

recipeBook.update(); //show which items can be crafted

controller.onSettled = () => { //update the crafting menu after each action finishes
  recipeBook.update();
};

// For poking at in the browser console, such as comparing logical state with
// presentation state: game.state
Object.assign(globalThis, {
  game: { state, grid, hud, sounds, presenter, controller },
});
