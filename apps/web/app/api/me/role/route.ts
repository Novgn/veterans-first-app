import { NextResponse } from "next/server";

import { getCurrentUserWithRole } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUserWithRole();
  return NextResponse.json({ role: user?.role ?? null });
}
