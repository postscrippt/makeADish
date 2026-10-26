// ProfileStore on Supabase (table `users`, see supabase/migrations/0001_init.sql). Server-only.
import type { Db } from "./db.ts";
import type { ProfileStore, SavedProfile } from "./profile.ts";
import type { SpiceLevel } from "../types/api.ts";

type Row = { allergen_ids: string[] | null; spice_level: number | null };

const toSaved = (row: Row, defaults: SavedProfile): SavedProfile => ({
  allergies: row.allergen_ids ?? [],
  spice: (row.spice_level ?? defaults.spice) as SpiceLevel,
});

export function createProfileStore(db: Db): ProfileStore {
  return {
    async getOrCreate(anonId, defaults) {
      // Insert only if missing, so an existing profile is never overwritten by a GET.
      const created = await db
        .from("users")
        .upsert({ id: anonId, allergen_ids: defaults.allergies, spice_level: defaults.spice }, { onConflict: "id", ignoreDuplicates: true });
      if (created.error) throw new Error(`users upsert: ${created.error.message}`);
      const { data, error } = await db.from("users").select("allergen_ids, spice_level").eq("id", anonId).single();
      if (error) throw new Error(`users select: ${error.message}`);
      return toSaved(data as Row, defaults);
    },
    async save(anonId, profile) {
      const { error } = await db.from("users").upsert({ id: anonId, allergen_ids: profile.allergies, spice_level: profile.spice }, { onConflict: "id" });
      if (error) throw new Error(`users save: ${error.message}`);
    },
  };
}
