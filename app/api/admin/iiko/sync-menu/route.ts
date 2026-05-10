import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { syncMenuFromIiko } from "@/lib/iiko/menu";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const organizationId = await prisma.settings.findUnique({
    where: { key: "iiko_organization_id" },
  });

  if (!organizationId?.value) {
    return NextResponse.json(
      { error: "Organization ID не настроен" },
      { status: 400 }
    );
  }

  try {
    const result = await syncMenuFromIiko(organizationId.value);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}