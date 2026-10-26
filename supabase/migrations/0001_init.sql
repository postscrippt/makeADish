-- AI Menu initial schema. Run in the Supabase SQL editor, or via the Supabase CLI.
-- The embedding size (768) must match the embedding model's output size.

create extension if not exists vector;

-- Allergens: small fixed list, id is a stable slug.
create table allergens (
  id      text primary key,
  name_th text not null,
  name_en text not null
);

-- Canonical ingredients: scan output and recipe ingredients both map to these ids.
create table ingredients (
  id       serial primary key,
  slug     text not null unique,
  name_th  text not null,
  name_en  text not null,
  aliases  text[] not null default '{}',
  category text
);
create index ingredients_aliases_idx on ingredients using gin (aliases);

-- Which allergens an ingredient contains (the rule-based tagging source).
create table ingredient_allergens (
  ingredient_id int  not null references ingredients(id) on delete cascade,
  allergen_id   text not null references allergens(id) on delete cascade,
  primary key (ingredient_id, allergen_id)
);

create table recipes (
  id             serial primary key,
  title_th       text not null,
  title_en       text,
  description    text,
  category       text,
  spice_level    smallint not null default 0 check (spice_level between 0 and 3),
  base_servings  smallint not null default 2 check (base_servings > 0),
  steps          jsonb not null default '[]',
  image_url      text,
  source         text,
  source_license text,
  is_thai_curated boolean not null default false,
  -- 'unknown' recipes must never be returned by search.
  allergen_status text not null default 'unknown'
    check (allergen_status in ('unknown', 'tagged', 'verified')),
  embedding      vector(768),
  created_at     timestamptz not null default now()
);
create index recipes_embedding_idx on recipes using hnsw (embedding vector_cosine_ops);
create index recipes_filter_idx on recipes (allergen_status, spice_level, category);

create table recipe_ingredients (
  recipe_id     int not null references recipes(id) on delete cascade,
  ingredient_id int not null references ingredients(id),
  quantity_text text,
  is_optional   boolean not null default false,
  primary key (recipe_id, ingredient_id)
);
create index recipe_ingredients_ingredient_idx on recipe_ingredients (ingredient_id);

-- Allergens per recipe, derived from its ingredients plus manual/LLM additions.
create table recipe_allergens (
  recipe_id   int  not null references recipes(id) on delete cascade,
  allergen_id text not null references allergens(id),
  primary key (recipe_id, allergen_id)
);

-- Users: anonymous browser ID now, LINE user ID later.
create table users (
  id               uuid primary key default gen_random_uuid(),
  line_user_id     text unique,
  spice_level      smallint check (spice_level between 0 and 3),
  default_servings smallint not null default 2,
  allergen_ids     text[] not null default '{}',
  created_at       timestamptz not null default now()
);

create table history (
  id          serial primary key,
  user_id     uuid not null references users(id) on delete cascade,
  recipe_id   int  not null references recipes(id),
  rating      smallint check (rating between 1 and 5),
  is_favorite boolean not null default false,
  cooked_at   timestamptz not null default now()
);
create index history_user_idx on history (user_id, cooked_at desc);

-- All access goes through the server with the service key.
-- RLS is on with no policies, so the public anon key can read nothing.
alter table allergens            enable row level security;
alter table ingredients          enable row level security;
alter table ingredient_allergens enable row level security;
alter table recipes              enable row level security;
alter table recipe_ingredients   enable row level security;
alter table recipe_allergens     enable row level security;
alter table users                enable row level security;
alter table history              enable row level security;

-- Seed the allergen list.
insert into allergens (id, name_th, name_en) values
  ('peanut',    'ถั่วลิสง',     'Peanut'),
  ('tree_nut',  'ถั่วเปลือกแข็ง', 'Tree nut'),
  ('shellfish', 'อาหารทะเลเปลือกแข็ง', 'Shellfish'),
  ('fish',      'ปลา',         'Fish'),
  ('egg',       'ไข่',         'Egg'),
  ('milk',      'นม',          'Milk'),
  ('soy',       'ถั่วเหลือง',    'Soy'),
  ('wheat',     'ข้าวสาลี',     'Wheat/gluten'),
  ('sesame',    'งา',          'Sesame');
