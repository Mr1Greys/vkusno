import { SignJWT, jwtVerify } from "jose";
import { getLoyaltyQrSecretBytes } from "@/lib/jwt-secret";

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

export async function verifyLoyaltyQrToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const secret = getLoyaltyQrSecretBytes();
    const { payload } = await jwtVerify(token, secret);
    if (payload.purpose !== LOYALTY_PURPOSE || typeof payload.sub !== "string") {
      return null;
    }
    return { userId: payload.sub };
  } catch {
    return null;
  }
}
