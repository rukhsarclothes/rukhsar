import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env";
import { requireAuth, type AuthenticatedRequest } from "../../common/middleware/auth";
import { authenticateUser, createUser } from "../../common/utils/file-store";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const router = Router();

function signTokens(payload: {
  id: string;
  email: string;
  fullName: string;
  role: "customer" | "admin";
}) {
  return {
    accessToken: jwt.sign(payload, env.jwtSecret, { expiresIn: "1h" }),
    refreshToken: jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: "7d" })
  };
}

router.post("/register", (request, response) => {
  const payload = registerSchema.parse(request.body);
  const user = createUser(payload);
  response.status(201).json({
    success: true,
    message: "User registered",
    user,
    ...signTokens(user)
  });
});

router.post("/login", (request, response) => {
  const payload = loginSchema.parse(request.body);
  const user = authenticateUser(payload.email, payload.password);
  if (!user) {
    response.status(401).json({ success: false, message: "Invalid credentials" });
    return;
  }

  response.json({
    success: true,
    user,
    ...signTokens(user)
  });
});

router.post("/refresh", (request, response) => {
  const payload = z.object({ refreshToken: z.string().min(1) }).safeParse(request.body);
  if (!payload.success) {
    response.status(400).json({ success: false, message: "Refresh token is required" });
    return;
  }

  try {
    const decoded = jwt.verify(payload.data.refreshToken, env.jwtRefreshSecret) as {
      id: string;
      email: string;
      fullName: string;
      role: "customer" | "admin";
    };

    response.json({
      success: true,
      ...signTokens({
        id: decoded.id,
        email: decoded.email,
        fullName: decoded.fullName,
        role: decoded.role
      })
    });
  } catch {
    response.status(401).json({ success: false, message: "Invalid refresh token" });
  }
});

router.post("/forgot-password", (request, response) => {
  const payload = z.object({ email: z.string().email() }).parse(request.body);
  response.json({
    success: true,
    message: `Password reset link queued for ${payload.email}`
  });
});

router.post("/reset-password", (request, response) => {
  z.object({ token: z.string(), password: z.string().min(8) }).parse(request.body);
  response.json({ success: true, message: "Password updated" });
});

router.get("/me", requireAuth, (request: AuthenticatedRequest, response) => {
  response.json({ success: true, user: request.user });
});

export { router as authRouter };
