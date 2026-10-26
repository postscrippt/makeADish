import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";

// cacheComponents is on: params is runtime data, so it must be read inside <Suspense>.
async function RecipeBody({ params }: Pick<PageProps<"/recipe/[id]">, "params">) {
  const { id } = await params;
  return <main className="p-4 text-zinc-500">TODO: steps, missing items, rating for recipe {id} (mock data)</main>;
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
