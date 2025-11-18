import { Role } from "@prisma/client";
import { ACCESS_TOKEN_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_SECRET, REFRESH_TOKEN_EXPIRES_IN } from "config/env";
import jsonwebtoken from "jsonwebtoken";

export const jwt = {
    generateAccessToken(userId: string, userRole: string): string {
        return jsonwebtoken.sign({ id: userId, role: userRole }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
    },

    generateRefreshToken(userId: string, userRole: string): string {
        return jsonwebtoken.sign({ id: userId, role: userRole }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
    },

    verifyAccessToken(token: string): { id: string, role: Role } {
        return jsonwebtoken.verify(token, JWT_SECRET) as { id: string, role: Role };
    },

    verifyRefreshToken(token: string): { id: string, role: Role } {
        return jsonwebtoken.verify(token, JWT_REFRESH_SECRET) as { id: string, role: Role };
    }
}