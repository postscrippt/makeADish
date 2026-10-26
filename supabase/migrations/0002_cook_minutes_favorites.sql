-- Follows docs/api-contract.md (issue #2). Run after 0001_init.sql.

-- Cooking time shown on result cards and the recipe page.
alter table recipes add column cook_minutes smallint check (cook_minutes > 0);

-- Favorites are separate from cook history, so a user can favorite a dish they have not cooked.
alter table history drop column is_favorite;

create table favorites (
  user_id    uuid not null references users(id) on delete cascade,
  recipe_id  int  not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

alter table favorites enable row level security;
