export type Recipe = {
  name: string;
  needs: Record<string, number>;
}; //items the player can make

export const RECIPES: Recipe[] = [
  {
    name: "rope",
    needs: { wood: 2 },
  },
  {
    name: "raft",
    needs: { wood: 3, rope: 1 },
  },
  {
    name: "map",
    needs: { wood: 3 },
  },
];

//function that makes sure every item can be crafted
export function reachableItems(
  sources: Set<string>,
  reciples: Recipe[] = RECIPES,
): Set<string> {
  const reachable = new Set(sources);
  let changed = true;

  while (changed) {
    changed = false;

    for (const reciple of reciples) {
      const cancraft = Object.keys(reciple.needs).every((item) =>
        reachable.has(item)
      );

      if (cancraft && !reachable.has(reciple.name)) {
        reachable.add(reciple.name);
        changed = true;
      }
    }
  }
  return reachable;
}
