import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settingsRowsToMap } from "@/lib/shop-settings";

export const dynamic = "force-dynamic";


const PUBLIC_KEYS = [
  "delivery_price",
  "delivery_free_from",
  "bonus_percent",
  "bonus_min_amount",
  "min_order_amount",
] as const;

export async function GET() {
  const rows = await prisma.settings.findMany({
    where: { key: { in: [...PUBLIC_KEYS] } },
  });
  const map = settingsRowsToMap(rows);

  const body: Record<string, string> = {};
  for (const k of PUBLIC_KEYS) {
    body[k] = map[k] ?? defaultFor(k);
  }

  return NextResponse.json(body);
}

function defaultFor(key: string): string {
  switch (key) {
    case "delivery_price":
      return "100";
    case "delivery_free_from":
      return "1000";
    case "bonus_percent":
      return "5";
    case "bonus_min_amount":
      return "200";
    case "min_order_amount":
      return "0";
    default:
      return "";
  }
}
