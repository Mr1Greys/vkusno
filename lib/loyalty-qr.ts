import { SignJWT, jwtVerify } from "jose";
import {
  getLoyaltyQrSecretBytes,
  getLoyaltyQrVerifySecretBytesList,
} from "@/lib/jwt-secret";
import { extractLoyaltyQrJwt } from "@/lib/extract-loyalty-qr-token";

const LOYALTY_PURPOSE = "loyalty_qr" as const;

export async function signLoyaltyQrToken(userId: string): Promise<string> {
  const secret = getLoyaltyQrSecretBytes();
  return new SignJWT({ purpose: LOYALTY_PURPOSE })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(secret);
}

export function normalizeLoyaltyQrToken(raw: string): string | null {
  return extractLoyaltyQrJwt(raw);
}

export async function verifyLoyaltyQrToken(
  raw: string
): Promise<{ userId: string } | null> {
  const token = normalizeLoyaltyQrToken(raw);
  if (!token) return null;

  const secrets = getLoyaltyQrVerifySecretBytesList();

  for (const secret of secrets) {
    try {
      const { payload } = await jwtVerify(token, secret, {
        clockTolerance: 120,
      });
      if (payload.purpose !== LOYALTY_PURPOSE || typeof payload.sub !== "string") {
        continue;
      }
      return { userId: payload.sub };
    } catch {
      continue;
    }
  }

  return null;
}
