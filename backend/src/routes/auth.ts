import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiter";
import { authenticate, AuthRequest } from "../middleware/authenticate";
import { sendWelcomeEmail } from "../lib/email";

const router = Router();

const REFRESH_COOKIE = "solmatch_refresh";
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain a number"),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().optional(),
  role: z.enum(["HOMEOWNER", "INSTALLER"]).default("HOMEOWNER"),
  consentGiven: z.boolean().refine((v) => v === true, "You must accept the terms"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as string,
  });
  const refreshToken = jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string,
  });
  return { accessToken, refreshToken };
}

router.post("/register", authLimiter, validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, role, consentGiven } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone, role, consentGiven, consentTimestamp: consentGiven ? new Date() : null },
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    // Fire-and-forget welcome email
    sendWelcomeEmail(user.email, user.firstName).catch(() => {});

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    res.status(201).json({
      accessToken,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  } catch {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.dataDeletedAt) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    res.json({
      accessToken,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (!refreshToken) {
    res.status(401).json({ error: "Refresh token required" });
    return;
  }
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string; role: string };
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      res.clearCookie(REFRESH_COOKIE, { path: "/" });
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const { accessToken, refreshToken: newRefresh } = generateTokens(payload.userId, payload.role);
    await prisma.refreshToken.create({
      data: { token: newRefresh, userId: payload.userId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
    res.cookie(REFRESH_COOKIE, newRefresh, COOKIE_OPTS);
    res.json({ accessToken });
  } catch {
    res.clearCookie(REFRESH_COOKIE, { path: "/" });
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.post("/logout", authenticate, async (req: AuthRequest, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  res.clearCookie(REFRESH_COOKIE, { path: "/" });
  res.json({ message: "Logged out" });
});

// POPIA: right to erasure
router.delete("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        email: `deleted-${req.user!.userId}@removed.invalid`,
        passwordHash: "DELETED",
        firstName: "Deleted",
        lastName: "User",
        phone: null,
        dataDeletedAt: new Date(),
      },
    });
    await prisma.refreshToken.deleteMany({ where: { userId: req.user!.userId } });
    res.clearCookie(REFRESH_COOKIE, { path: "/" });
    res.json({ message: "Your account and personal data have been deleted in compliance with POPIA." });
  } catch {
    res.status(500).json({ error: "Deletion failed" });
  }
});

export default router;
