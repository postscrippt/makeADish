// Allergen rules (issue #21): which allergens each canonical ingredient contains. This is the PRIMARY source;
// any LLM tagger is only a second check and can never remove an allergen from here.
//
//   ["fish"]  tagged: these allergens are present.
//   []        tagged: the ingredient has no listed allergens.
//   null      UNKNOWN: contents vary by brand or recipe. An unknown ingredient makes any recipe or swap that
//             uses it unknown, and unknown is never shown. When unsure, use null, never [].
//
// Allergen ids match the `allergens` table: peanut, tree_nut, shellfish, fish, egg, milk, soy, wheat, sesame.
// Conventions (kept from the mock recipes): squid and other molluscs count as `shellfish`; oyster sauce is
// shellfish + soy + wheat; soy sauce is soy + wheat; coconut is NOT a tree nut.
// Every ingredient in data/ingredients.ts must appear here (a test checks), so a new ingredient forces a decision.
// A person who knows Thai cooking should review this file, especially the null entries and the marked judgments.

export const ALLERGEN_IDS = ["peanut", "tree_nut", "shellfish", "fish", "egg", "milk", "soy", "wheat", "sesame"] as const;
export type AllergenId = (typeof ALLERGEN_IDS)[number];

export const allergenRules: Record<string, AllergenId[] | null> = {
  // Fresh meat: no listed allergens
  pork: [], chicken: [], beef: [], duck: [],
  // Processed meat: recipes vary (soy, wheat, milk, fish), so unknown
  sausage: null, "chinese-sausage": null, bacon: null, ham: null,

  // Seafood
  shrimp: ["shellfish"], "dried-shrimp": ["shellfish"], "shrimp-paste": ["shellfish"],
  squid: ["shellfish"], crab: ["shellfish"], clam: ["shellfish"], mussel: ["shellfish"],
  fish: ["fish"], mackerel: ["fish"],
  "fish-ball": null, // fish plus starch/wheat/egg depending on the maker

  // Egg and dairy
  egg: ["egg"], "duck-egg": ["egg"], "salted-egg": ["egg"],
  milk: ["milk"], "condensed-milk": ["milk"], butter: ["milk"], cheese: ["milk"],

  // Vegetables, herbs, fruit: none
  garlic: [], shallot: [], onion: [], "spring-onion": [], chili: [], "big-chili": [], "dried-chili": [],
  "bell-pepper": [], tomato: [], cabbage: [], cauliflower: [], broccoli: [], "chinese-kale": [],
  "morning-glory": [], "napa-cabbage": [], "choy-sum": [], lettuce: [], "bean-sprout": [], "long-bean": [],
  "green-papaya": [], pumpkin: [], cucumber: [], carrot: [], potato: [], "sweet-potato": [], daikon: [],
  corn: [], "baby-corn": [], mushroom: [], eggplant: [], "garlic-chive": [], celery: [], "bamboo-shoot": [],
  ginger: [], turmeric: [],
  "holy-basil": [], "thai-basil": [], "lemon-basil": [], lemongrass: [], galangal: [], krachai: [],
  "kaffir-lime-leaf": [], coriander: [], "saw-coriander": [], mint: [], pandan: [],
  lime: [], "lime-zest": [], "tamarind-paste": [], mango: [], pineapple: [], banana: [],
  "coconut-milk": [], // judgment: coconut is not treated as a tree nut

  // Sauces
  "fish-sauce": ["fish"],
  "oyster-sauce": ["shellfish", "soy", "wheat"],
  "soy-sauce": ["soy", "wheat"],
  "dark-soy-sauce": ["soy", "wheat"],
  "sweet-soy-sauce": ["soy", "wheat"],
  "seasoning-sauce": ["soy", "wheat"], // judgment: some brands also add fish or other items; check the label
  "bean-paste": ["soy", "wheat"],
  mayonnaise: ["egg"],
  ketchup: [],
  vinegar: [],
  "red-curry-paste": ["shellfish"], // shrimp paste; check the jar, some add fish or peanut
  "green-curry-paste": ["shellfish"], // same
  "chili-paste": null, // น้ำพริกเผา usually has dried shrimp and varies a lot
  "chili-sauce": null, // some brands add fish or other items
  stock: null, // store-bought stock varies (soy, wheat, milk, fish)
  "fried-garlic": [],

  // Seasonings and oils
  salt: [], sugar: [], "palm-sugar": [], pepper: [], "chili-flakes": [], "five-spice": [],
  "toasted-rice-powder": [],
  "curry-powder": null, // blends vary
  "sesame-oil": ["sesame"],
  "cooking-oil": [], // decided by the owner: refined cooking oil is fine for people with a soy allergy

  // Staples and noodles
  rice: [], "sticky-rice": [],
  flour: ["wheat"], "tapioca-starch": [], cornstarch: [],
  bread: null, // wheat, but also milk, egg, soy or sesame depending on the loaf
  tofu: ["soy"], "silken-tofu": ["soy"],
  "rice-noodle": [], "rice-vermicelli": [], "glass-noodle": [],
  "egg-noodle": ["wheat", "egg"],
  "instant-noodle": null, // flavor sachets vary (wheat, soy, fish, shellfish, milk)

  // Nuts and seeds
  peanut: ["peanut"], cashew: ["tree_nut"], almond: ["tree_nut"], "almond-milk": ["tree_nut"],
  sesame: ["sesame"],
};
