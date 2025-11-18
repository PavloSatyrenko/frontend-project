import { Request, Response, NextFunction } from "express";

// Should be used after authMiddleware
export function adminMiddleware(request: Request, response: Response, next: NextFunction): void {
    try {
        if (request.user?.role !== "ADMIN") {
            response.status(403).json({ message: "Forbidden" });
            return;
        }

        next();
    } catch {
        response.status(401).json({ message: "Unauthorized" });
    }
};