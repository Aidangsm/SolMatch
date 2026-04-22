import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/authenticate";

const router = Router();

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        consentGiven: true,
        consentTimestamp: true,
        createdAt: true,
        dataDeletedAt: true,
        installer: {
          select: { id: true, companyName: true, verified: true, badgeActive: true },
        },
      },
    });
    if (!user || user.dataDeletedAt) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    // Strip dataDeletedAt before sending
    const { dataDeletedAt: _omit, ...safeUser } = user;
    res.json(safeUser);
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
