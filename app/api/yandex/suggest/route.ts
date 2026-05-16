import { NextRequest, NextResponse } from "next/server";
import { yandexSuggestRequest } from "@/lib/yandex/suggest-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text");
  const city = request.nextUrl.searchParams.get("city") ?? undefined;

  if (!text?.trim()) {
    return NextResponse.json({ error: "Параметр text обязателен" }, { status: 400 });
  }

  try {
    const results = await yandexSuggestRequest(text, { city });
    return NextResponse.json({ results });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка Геосаджеста";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
