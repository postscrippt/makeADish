import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import RecipeView from "./RecipeView";

// cacheComponents is on: params and searchParams are runtime data, so they must be read inside <Suspense>.
async function RecipeBody({ params, searchParams }: PageProps<"/recipe/[id]">) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  return <RecipeView id={id} fromSearch={from === "results"} />;
}

export default function RecipePage({ params, searchParams }: PageProps<"/recipe/[id]">) {
  return (
    <>
      <PageHeader title="สูตรอาหาร" />
      <Suspense fallback={<main className="p-4 text-muted">กำลังโหลด…</main>}>
        <RecipeBody params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
