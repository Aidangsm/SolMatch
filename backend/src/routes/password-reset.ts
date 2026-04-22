import { Router, Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiter";
import { sendPasswordResetEmail } from "../lib/email";

const router = Router();

const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).regex(/[A-Z]/, "Must contain uppercase").regex(/[0-9]/, "Must contain a number"),
});

router.post("/forgot", authLimiter, validate(forgotSchema), async (req: Request, res: Response) => {
  // Always return 200 so we don't reveal whether an email exists (POPIA / security)
  res.json({ message: "If that email is registered, a reset link has been sent." });

  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (!user || user.dataDeletedAt) return;

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });

    await sendPasswordResetEmail(user.email, user.firstName, token);
  } catch {
    // Swallow — response already sent
  }
});

router.post("/reset", authLimiter, validate(resetSchema), async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.used || record.expiresAt < new Date()) {
      res.status(400).json({ error: "Invalid or expired reset link. Please request a new one." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { token }, data: { used: true } }),
      prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    res.json({ message: "Password reset successfully. Please log in with your new password." });
  } catch {
    res.status(500).json({ error: "Reset failed. Please try again." });
  }
});

export default router;
