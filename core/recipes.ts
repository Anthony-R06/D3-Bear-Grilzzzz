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
];
