import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkIikoConnection } from "@/lib/iiko/client";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const result = await checkIikoConnection();
  return NextResponse.json(result);
}