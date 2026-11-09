"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import SearchForm from "@/components/SearchForm";
import { getIngredients, getOptions, getProfile, saveProfile } from "@/mocks/api";
import { startSearch } from "@/app/draft";
import { canSendToChat, closeToChat, sendToChat } from "@/app/liff";
import { searchMessage } from "@/app/searchMessage";
import { useLang } from "@/app/lang";
import type { Ingredient, Options, Profile, SpiceLevel } from "@/types/api";

type Loaded = { catalog: Ingredient[]; profile: Profile; options: Options };

// Typing ingredients by hand ("พิมพ์เอง"). It is the same form as the Results edit sheet (SearchForm), so picking and
// editing are one screen. The user chose every item, so there is nothing to confirm; allergies sit right here because
// no confirm card showed them first.
// Inside LINE it hands the pick back to the chat; on the web (no chat) it goes to /results.
// A link with ?ids= is the chat's [แก้ไข] button; editing lives on Results, so it forwards there with the sheet open.
export default function FormPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [syncFailed, setSyncFailed] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const ids = new URLSearchParams(location.search).get("ids");
    if (ids !== null) return router.replace(`/results?ids=${encodeURIComponent(ids)}&edit=1`);
    Promise.all([getIngredients(), getProfile(), getOptions()]).then(([catalog, profile, options]) => setLoaded({ catalog, profile, options }));
  }, [router]);

  async function submit(tags: Ingredient[], allergies: string[], spice: SpiceLevel) {
    if (!loaded || tags.length === 0) return;
    const { profile } = loaded;
    const next = { ...profile, allergies, spice };
    setSyncFailed(false);
    // The chat filters by the saved profile, so a failed save must be seen here: Results is a different page.
    if (allergies.join() !== profile.allergies.join() || spice !== profile.spice) {
      try {
        await saveProfile(next);
      } catch {
        return setSyncFailed(true);
      }
    }
    // Opened from the chat: post the names as the user's own message and close, so the carousel arrives in the chat,
    // the one place to pick a dish. If posting fails (no permission, offline), show the results here instead of stranding them.
    if (await canSendToChat()) {
      try {
        await sendToChat([{ type: "text", text: searchMessage(tags) }]);
        return closeToChat();
      } catch {
        // fall through to the web results
      }
    }
    startSearch(tags, next);
    router.push("/results");
  }

  if (!loaded) {
    return (
      <>
        <PageHeader title={t("form.title")} />
        <p role="status" className="p-4 text-sm text-muted">{t("common.loading")}</p>
      </>
    );
  }

  return (
    // Column fills the screen so the button bar sits at the bottom even when the list is short.
    <div className="flex min-h-dvh flex-col">
      <PageHeader title={t("form.title")} />
      {syncFailed && (
        <p role="alert" className="mx-5 mt-4 rounded-2xl bg-white p-3 text-sm text-red-700">{t("form.syncFailed")}</p>
      )}
      <SearchForm
        layout="page"
        catalog={loaded.catalog}
        allergens={loaded.options.allergens}
        tags={[]}
        allergies={loaded.profile.allergies}
        spice={loaded.profile.spice}
        applyLabel={(n) => (n > 0 ? t("form.apply", { n }) : t("search.addFirst"))}
        onApply={submit}
        autoFocus
      />
    </div>
  );
}
