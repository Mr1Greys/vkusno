import { NextRequest, NextResponse } from "next/server";
import { resolveDeliveryCoordinates } from "@/lib/yandex/geocode-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address") ?? "";
  const uri = request.nextUrl.searchParams.get("uri") ?? undefined;

  if (!address.trim() && !uri?.trim()) {
    return NextResponse.json(
      { error: "Нужен параметр address или uri" },
      { status: 400 }
    );
  }

  const result = await resolveDeliveryCoordinates({ address, uri });
  return NextResponse.json(result);
}
