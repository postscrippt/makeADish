import { Suspense } from "react";
import RecipeView, { RecipeLoading } from "./RecipeView";

// cacheComponents is on: params and searchParams are runtime data, so they must be read inside <Suspense>.
// RecipeView draws the header itself: the recipe's title lives in the teal hero.
async function RecipeBody({ params, searchParams }: PageProps<"/recipe/[id]">) {
  const [{ id }, { from, missing, ids, cook }] = await Promise.all([params, searchParams]);
  // From a chat recipe card: ?cook=1 jumps to the steps, ?missing=a,b marks what to buy.
  const missingIds = typeof missing === "string" ? missing.split(",") : [];
  // From the LINE chat carousel: ?ids=a,b is what the user has, so the page can work out what's missing.
  const haveIds = typeof ids === "string" ? ids.split(",") : [];
  return (
    <RecipeView id={id} fromSearch={from === "results"} missingIds={missingIds} haveIds={haveIds} cook={cook === "1"} />
  );
}

export default function RecipePage({ params, searchParams }: PageProps<"/recipe/[id]">) {
  return (
    <Suspense fallback={<RecipeLoading />}>
      <RecipeBody params={params} searchParams={searchParams} />
    </Suspense>
  );
}
