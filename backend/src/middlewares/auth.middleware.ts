import { Role } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { jwt } from "utils/jwt";

export function optionalAuthMiddleware(request: Request, response: Response, next: NextFunction): void {
    const accessToken: string | undefined = request.headers.authorization?.split(" ")[1]

    if (!accessToken) {
        next();
        return;
    }

    try {
        const user: { id: string, role: Role } = jwt.verifyAccessToken(accessToken);
        request.user = { id: user.id, role: user.role };
        next();
    } catch {
        next();
    }
}

export function authMiddleware(request: Request, response: Response, next: NextFunction): void {
    const accessToken: string | undefined = request.headers.authorization?.split(" ")[1]

    if (!accessToken) {
        response.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const user: { id: string, role: Role } = jwt.verifyAccessToken(accessToken);
        request.user = { id: user.id, role: user.role };
        next();
    } catch {
        response.status(401).json({ message: "Unauthorized" });
    }
};