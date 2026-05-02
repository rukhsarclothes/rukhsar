import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: "customer" | "admin";
    email: string;
    fullName?: string;
  };
};

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    response.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  const token = header.replace("Bearer ", "");

  try {
    request.user = jwt.verify(token, env.jwtSecret) as AuthenticatedRequest["user"];
    next();
  } catch {
    response.status(401).json({ success: false, message: "Invalid token" });
  }
}

export function requireAdmin(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  if (request.user?.role !== "admin") {
    response.status(403).json({ success: false, message: "Admin access required" });
    return;
  }

  next();
}
