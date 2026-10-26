// GET and PUT /api/profile (docs/api-contract.md). The rules are in lib/profile.ts.
// Server-only: LINE_LOGIN_CHANNEL_ID turns on linking a saved profile to a verified LINE user (header x-line-id-token).
import { getDb } from "@/lib/db";
import { createLineLogin } from "@/lib/line/idToken";
import { handleProfileGet, handleProfilePut } from "@/lib/profile";
import { createProfileStore } from "@/lib/profileStore";

const store = () => {
  const db = getDb();
  return db ? createProfileStore(db) : null;
};

const lineLogin = () => {
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID?.trim();
  return channelId ? createLineLogin(channelId) : null;
};

export async function GET(request: Request) {
  return handleProfileGet(request, store());
}

export async function PUT(request: Request) {
  return handleProfilePut(request, store(), lineLogin());
}
