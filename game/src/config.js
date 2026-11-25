// Ember & Ladle — configuration: canvas, kitchen layout, ingredients and recipes.
// One job: every number and name the rest of the game reads, so tuning the game
// never means hunting through logic.

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const HUD_H = 96;
export const DAY_SECONDS = 150;
export const CHEF_SPEED = 265;
export const CHEF_RADIUS = 20;
export const HAND_LIMIT = 2;
export const MAX_TICKETS = 4;
export const TICKET_PATIENCE = 50;
export const BURN_AFTER = 5;

// Every ingredient the pantry stocks, with its kitchen colour and its rules:
// chopSeconds 0 means it never needs the board; cookSeconds 0 means it never
// needs the stove; chopFirst means it must be chopped before it can cook.
export const INGREDIENTS = {
  tomato:   { label: 'Tomato',   color: '#e5484d', dark: '#b3272e', chopSeconds: 1.6, cookSeconds: 0, chopFirst: false },
  lettuce:  { label: 'Lettuce',  color: '#58b368', dark: '#2f7d3d', chopSeconds: 1.6, cookSeconds: 0, chopFirst: false },
  onion:    { label: 'Onion',    color: '#c9a7e8', dark: '#8a63b8', chopSeconds: 1.6, cookSeconds: 3,   chopFirst: true  },
  mushroom: { label: 'Mushroom', color: '#d8c3a5', dark: '#a08056', chopSeconds: 1.6, cookSeconds: 3,   chopFirst: true  },
  steak:    { label: 'Steak',    color: '#a34d2d', dark: '#6e2f18', chopSeconds: 0,   cookSeconds: 5,   chopFirst: false },
  pasta:    { label: 'Pasta',    color: '#f2c14e', dark: '#c08f1d', chopSeconds: 0,   cookSeconds: 4,   chopFirst: false },
  bread:    { label: 'Bread',    color: '#e0a458', dark: '#a86f2c', chopSeconds: 0,   cookSeconds: 3,   chopFirst: false },
  cheese:   { label: 'Cheese',   color: '#ffd94d', dark: '#d9a400', chopSeconds: 0,   cookSeconds: 3,   chopFirst: false },
};

// A recipe is a set of finished items: { kind, state } pairs. Chopped items
// read "chopped", cooked items read "cooked"; a plate matches a ticket only
// when the carried set equals one ticket's needs exactly.
export const RECIPES = [
  {
    id: 'salad',
    name: 'Garden Salad',
    price: 12,
    needs: [
      { kind: 'lettuce', state: 'chopped' },
      { kind: 'tomato', state: 'chopped' },
    ],
  },
  {
    id: 'pasta',
    name: 'Tomato Pasta',
    price: 18,
    needs: [
      { kind: 'pasta', state: 'cooked' },
      { kind: 'tomato', state: 'chopped' },
    ],
  },
  {
    id: 'soup',
    name: 'Mushroom Soup',
    price: 20,
    needs: [
      { kind: 'mushroom', state: 'cooked' },
      { kind: 'onion', state: 'cooked' },
    ],
  },
  {
    id: 'steak',
    name: 'Steak Plate',
    price: 24,
    needs: [
      { kind: 'steak', state: 'cooked' },
      { kind: 'onion', state: 'chopped' },
    ],
  },
  {
    id: 'melt',
    name: 'Cheese Melt',
    price: 16,
    needs: [
      { kind: 'bread', state: 'cooked' },
      { kind: 'cheese', state: 'cooked' },
    ],
  },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

// Kitchen stations, in logical pixels. Bins sit on the left wall, boards and
// stoves in the middle, the plating counter low on the right, the serving
// window high on the right, the trash bin low on the left.
export const STATIONS = {
  bins: [
    { kind: 'tomato',   x: 24,  y: 128, w: 150, h: 108 },
    { kind: 'lettuce',  x: 24,  y: 252, w: 150, h: 108 },
    { kind: 'onion',    x: 24,  y: 376, w: 150, h: 108 },
    { kind: 'mushroom', x: 24,  y: 500, w: 150, h: 108 },
    { kind: 'steak',    x: 190, y: 128, w: 150, h: 108 },
    { kind: 'pasta',    x: 190, y: 252, w: 150, h: 108 },
    { kind: 'bread',    x: 190, y: 376, w: 150, h: 108 },
    { kind: 'cheese',   x: 190, y: 500, w: 150, h: 108 },
  ],
  boards: [
    { x: 420, y: 300, w: 190, h: 96 },
    { x: 420, y: 480, w: 190, h: 96 },
  ],
  stoves: [
    { x: 700, y: 300, w: 190, h: 96 },
    { x: 700, y: 480, w: 190, h: 96 },
  ],
  plating: { x: 960, y: 620, w: 296, h: 140 },
  window: { x: 1000, y: 128, w: 256, h: 108 },
  trash: { x: 24, y: 660, w: 150, h: 108 },
};

// The floor the chef may walk on: everything below the HUD except the
// station rectangles, which are solid.
export const FLOOR = { x: 8, y: HUD_H + 8, w: VIEW_W - 16, h: VIEW_H - HUD_H - 16 };

export const PALETTE = {
  floorA: '#f3d9a4',
  floorB: '#eec887',
  wall: '#7c4a2d',
  wood: '#a9713f',
  woodDark: '#7d4f27',
  steel: '#c8ccd4',
  steelDark: '#9aa0ab',
  cream: '#fff6e3',
  ink: '#2b1d12',
  red: '#e5484d',
  green: '#3f9e4d',
  gold: '#f2c14e',
};
