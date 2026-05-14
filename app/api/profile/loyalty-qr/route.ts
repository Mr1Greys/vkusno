import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { signLoyaltyQrToken } from "@/lib/loyalty-qr";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const token = await signLoyaltyQrToken(session.id);
  return NextResponse.json({ token });
}
