-- Task 1 of docs/superpowers/plans/2026-10-26-person-b-backend.md. Run after 0002_cook_minutes_favorites.sql.

-- Servings left the app. Recipes keep base_servings for the "สำหรับ N ที่" label.
alter table users drop column default_servings;

-- An ingredient with no rows in ingredient_allergens could mean "no allergens" or "not tagged yet".
-- 'tagged' means its allergens (possibly none) are recorded, so absence of rows is meaningful.
alter table ingredients
  add column allergen_status text not null default 'unknown'
  check (allergen_status in ('unknown', 'tagged'));

-- Swap suggestions for the missing-ingredient "ใช้อะไรแทนได้?" list.
-- One row is one option, which can be several ingredients (for example dark soy sauce + sugar).
-- An option's allergens are derived from ingredient_allergens of its ingredients; if any of them is
-- 'unknown', the option counts as unknown and is hidden (same rule as recipes).
-- option_ingredient_ids holds ingredients.slug values; arrays cannot carry a foreign key,
-- so the seed script must reject slugs that do not exist.
create table substitutes (
  id                    serial primary key,
  ingredient_id         int  not null references ingredients(id) on delete cascade,
  label_th              text not null,
  option_ingredient_ids text[] not null check (cardinality(option_ingredient_ids) > 0),
  unique (ingredient_id, label_th)
);
create index substitutes_ingredient_idx on substitutes (ingredient_id);

alter table substitutes enable row level security;
