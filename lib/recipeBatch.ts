// Reads a recipe batch file (data/recipes/batch-N.md) into recipe drafts, and checks each draft against the rules.
// Anything doubtful throws, so a bad dish stops the load instead of reaching the database.
import { allergensOf, type AllergenRules } from "./allergens.ts";

export const CATEGORIES = ["stir-fry", "soup", "curry", "salad", "fried"];

export type RecipeDraft = {
  slug: string; // only used in this file's tests and messages; the database id is a number
  th: string;
  description: string;
  category: string;
  spice: number;
  minutes: number;
  servings: number;
  documentedAllergens: string[]; // what the author wrote; must equal what the rules derive
  ingredients: { slug: string; qty: string }[];
  steps: string[];
};

const HEADER = /^(.*?)\s*([a-z-]+) · spice (\d) · (\d+) min · serves (\d+) · allergens:\s*(.*)$/;

export function parseBatch(md: string): RecipeDraft[] {
  const sections = md.replace(/\r\n/g, "\n").split(/^## \d+\. /m).slice(1);
  return sections.map((section) => {
    const lines = section.split("\n");
    const title = /^(.+?) \(`([a-z0-9-]+)`\)\s*$/.exec(lines[0]);
    if (!title) throw new Error(`Cannot read the dish title: "${lines[0]}"`);
    const [, th, slug] = title;
    const fail = (why: string): never => {
      throw new Error(`${slug}: ${why}`);
    };

    const header = lines.map((l) => HEADER.exec(l)).find(Boolean) ?? fail("no header line (category · spice · min · serves · allergens)");
    const [, description, category, spice, minutes, servings, allergenText] = header!;
    const documentedAllergens = [...allergenText.matchAll(/`([a-z_]+)`/g)].map((m) => m[1]).sort();

    const ingredients = lines.flatMap((l) => {
      const m = /^\|\s*[^|]*\|\s*`([a-z0-9-]+)`\s*\|\s*([^|]*?)\s*\|\s*$/.exec(l);
      return m ? [{ slug: m[1], qty: m[2] }] : [];
    });
    const steps = lines.flatMap((l) => {
      const m = /^\d+\.\s+(.+?)\s*$/.exec(l);
      return m ? [m[1]] : [];
    });

    return {
      slug,
      th,
      description: description.trim(),
      category,
      spice: Number(spice),
      minutes: Number(minutes),
      servings: Number(servings),
      documentedAllergens,
      ingredients,
      steps,
    };
  });
}

export type DerivedDraft = RecipeDraft & { allergens: string[] | null };

// The safety check. Throws on the first problem; returns each dish with the allergens the rules derive.
export function checkDrafts(drafts: RecipeDraft[], knownIngredients: Set<string>, rules: AllergenRules): DerivedDraft[] {
  const seen = new Set<string>();
  return drafts.map((d) => {
    const fail = (why: string): never => {
      throw new Error(`${d.slug}: ${why}`);
    };
    if (seen.has(d.slug)) fail("duplicate dish id");
    seen.add(d.slug);
    if (!CATEGORIES.includes(d.category)) fail(`unknown category "${d.category}"`);
    if (!Number.isInteger(d.spice) || d.spice < 0 || d.spice > 3) fail("spice must be 0 to 3");
    if (d.minutes <= 0) fail("minutes must be above 0");
    if (d.servings <= 0) fail("servings must be above 0");
    if (d.ingredients.length === 0) fail("no ingredients");
    if (d.steps.length === 0) fail("no steps");
    const slugs = d.ingredients.map((i) => i.slug);
    if (new Set(slugs).size !== slugs.length) fail("an ingredient is listed twice");
    const missing = slugs.filter((s) => !knownIngredients.has(s));
    if (missing.length) fail(`ingredient ids not in the table: ${missing.join(", ")}`);
    for (const i of d.ingredients) if (!i.qty) fail(`ingredient ${i.slug} has no amount`);

    const allergens = allergensOf(slugs, rules);
    if (allergens === null) fail("an ingredient has unknown allergens, so the dish would be hidden; decide its rule first");
    if (JSON.stringify(allergens) !== JSON.stringify(d.documentedAllergens)) {
      fail(`the allergens written in the file (${d.documentedAllergens.join(",") || "none"}) differ from the ingredient rules (${allergens!.join(",") || "none"}); fix the ingredient list or the rule`);
    }
    return { ...d, allergens };
  });
}
