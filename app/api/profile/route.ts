// GET and PUT /api/profile (docs/api-contract.md). The rules are in lib/profile.ts.
import { getDb } from "@/lib/db";
import { handleProfileGet, handleProfilePut } from "@/lib/profile";
import { createProfileStore } from "@/lib/profileStore";

const store = () => {
  const db = getDb();
  return db ? createProfileStore(db) : null;
};

export async function GET(request: Request) {
  return handleProfileGet(request, store());
}

export async function PUT(request: Request) {
  return handleProfilePut(request, store());
}
