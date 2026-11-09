"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Chip from "@/components/Chip";
import RecipeCard from "@/components/RecipeCard";
import { getOptions, getProfile, listRecipes } from "@/mocks/api";
import { useLang } from "@/app/lang";
import { allergenName, dishCategoryName } from "@/app/text";
import type { Option, RecipeSummary } from "@/types/api";

type Loaded = { recipes: RecipeSummary[]; categories: Option[]; hiddenFor: Option[] };

export default function MenusPage() {
  const [data, setData] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const { lang, t } = useLang();

  useEffect(() => {
    getProfile()
      .then(async (profile) => {
        const [recipes, options] = await Promise.all([listRecipes(profile.allergies), getOptions()]);
        const hiddenFor = options.allergens.filter((a) => profile.allergies.includes(a.id));
        setData({ recipes, categories: options.categories, hiddenFor });
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <Shell><p role="alert" className="p-5 text-red-700">{t("menus.loadFailed")}</p></Shell>;
  if (!data) return <Shell><p role="status" className="p-5 text-sm text-muted">{t("common.loading")}</p></Shell>;

  const q = query.trim().toLowerCase();
  const categoryName = (id: string) => {
    const c = data.categories.find((x) => x.id === id);
    return c ? dishCategoryName(c, lang) : "";
  };
  const shown = data.recipes.filter(
    (r) => (category === null || r.category === category) && (!q || r.th.includes(q) || r.en.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHeader title={t("menus.title")}>
        <h2 className="text-3xl leading-tight font-bold text-butter">{t("menus.headline")}</h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("menus.searchPlaceholder")}
          aria-label={t("menus.searchLabel")}
          className="mt-4 min-h-12 w-full rounded-full bg-white px-5 text-base text-ink"
        />
        <div role="group" aria-label={t("menus.categories")} className="mt-4 flex flex-wrap gap-2">
          <Chip selected={category === null} onClick={() => setCategory(null)}>{t("menus.all")}</Chip>
          {data.categories.map((c) => (
            <Chip key={c.id} selected={category === c.id} onClick={() => setCategory(c.id)}>
              {dishCategoryName(c, lang)}
            </Chip>
          ))}
        </div>
      </PageHeader>
      <main className="flex flex-col gap-4 px-5 pt-6 pb-10">
        <p className="text-sm text-muted">
          {t("menus.count", { n: shown.length })}
          {data.hiddenFor.length > 0 && t("menus.hiddenFor", { names: data.hiddenFor.map((a) => allergenName(a, lang)).join(", ") })}
        </p>

        {shown.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted">{t("menus.noResults")}</p>
            <button type="button" onClick={() => { setQuery(""); setCategory(null); }} className="btn-secondary px-6">{t("menus.showAll")}</button>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {shown.map((r) => (
              <li key={r.id}>
                <RecipeCard recipe={r} category={categoryName(r.category)} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  return (
    <>
      <PageHeader title={t("menus.title")} />
      {children}
    </>
  );
}
