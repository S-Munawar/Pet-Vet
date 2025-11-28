// utils/jwt.ts
import jwt from "jsonwebtoken";

export const ACCESS_TOKEN_TTL = "60m";
export const REFRESH_TOKEN_TTL = "30d"; // can adjust

export function signAccessToken(userId: string) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

export function signRefreshToken(userId: string) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
}
