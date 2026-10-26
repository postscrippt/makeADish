// POST and GET /api/history (docs/api-contract.md). The rules are in lib/userDataApi.ts.
import { handleHistoryGet, handleHistoryPost } from "@/lib/userDataApi";
import { userDataDeps } from "@/lib/serverDeps";

export async function POST(request: Request) {
  return handleHistoryPost(request, userDataDeps());
}

export async function GET(request: Request) {
  return handleHistoryGet(request, userDataDeps());
}
