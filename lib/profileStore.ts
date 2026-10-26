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
    async linkLine(anonId, lineUserId) {
      // line_user_id is unique, so free it from any other user first. If this fails half way the id is simply
      // unlinked, which the chat treats as "no profile" and says so.
      const freed = await db.from("users").update({ line_user_id: null }).eq("line_user_id", lineUserId).neq("id", anonId);
      if (freed.error) throw new Error(`users unlink: ${freed.error.message}`);
      const { error } = await db.from("users").update({ line_user_id: lineUserId }).eq("id", anonId);
      if (error) throw new Error(`users link: ${error.message}`);
    },
    async findByLineUserId(lineUserId) {
      const { data, error } = await db.from("users").select("allergen_ids, spice_level").eq("line_user_id", lineUserId).maybeSingle();
      if (error) throw new Error(`users find: ${error.message}`);
      return data ? toSaved(data as Row, { allergies: [], spice: 1 }) : null;
    },
    async save(anonId, profile) {
      const { error } = await db.from("users").upsert({ id: anonId, allergen_ids: profile.allergies, spice_level: profile.spice }, { onConflict: "id" });
      if (error) throw new Error(`users save: ${error.message}`);
    },
  };
}
