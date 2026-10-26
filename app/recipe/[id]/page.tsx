import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import RecipeView from "./RecipeView";

// cacheComponents is on: params is runtime data, so it must be read inside <Suspense>.
async function RecipeBody({ params }: Pick<PageProps<"/recipe/[id]">, "params">) {
  const { id } = await params;
  return <RecipeView id={id} />;
}

export default function RecipePage({ params }: PageProps<"/recipe/[id]">) {
  return (
    <>
      <PageHeader title="สูตรอาหาร" />
      <Suspense fallback={<main className="p-4 text-zinc-400">กำลังโหลด…</main>}>
        <RecipeBody params={params} />
      </Suspense>
    </>
  );
}
