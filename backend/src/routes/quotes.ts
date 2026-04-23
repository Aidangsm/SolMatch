import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { generalLimiter } from "../middleware/rateLimiter";
import { sendNewLeadEmail, sendQuoteStatusEmail } from "../lib/email";

const router = Router();

const createQuoteSchema = z.object({
  installerId: z.string().min(1),
  monthlyBill: z.number().min(100).max(100000),
  systemSizeKw: z.number().min(0.5).max(1000),
  province: z.string().min(2),
  city: z.string().min(2),
  propertyType: z.enum(["RESIDENTIAL", "COMMERCIAL", "AGRICULTURAL"]).default("RESIDENTIAL"),
  roofType: z.string().optional(),
  notes: z.string().max(500).optional(),
});

const updateQuoteSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED", "COMPLETED"]).optional(),
  estimatedCost: z.number().optional(),
  installerNotes: z.string().max(500).optional(),
});

router.post("/", authenticate, requireRole("HOMEOWNER"), generalLimiter, validate(createQuoteSchema), async (req: AuthRequest, res: Response) => {
  try {
    const installer = await prisma.installer.findUnique({
      where: { id: req.body.installerId },
      include: { user: { select: { email: true } } },
    });
    if (!installer) {
      res.status(404).json({ error: "Installer not found" });
      return;
    }
    const quote = await prisma.quote.create({
      data: { ...req.body, homeownerId: req.user!.userId },
    });

    // Notify installer of new lead
    sendNewLeadEmail(installer.user.email, installer.companyName, req.body.city, req.body.systemSizeKw).catch(() => {});

    res.status(201).json(quote);
  } catch {
    res.status(500).json({ error: "Failed to create quote" });
  }
});

router.get("/mine", authenticate, requireRole("HOMEOWNER"), async (req: AuthRequest, res: Response) => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { homeownerId: req.user!.userId },
      include: { installer: { select: { companyName: true, phone: true, email: true, avgRating: true, verified: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(quotes);
  } catch {
    res.status(500).json({ error: "Failed to fetch quotes" });
  }
});

router.get("/leads", authenticate, requireRole("INSTALLER"), async (req: AuthRequest, res: Response) => {
  try {
    const installer = await prisma.installer.findUnique({ where: { userId: req.user!.userId } });
    if (!installer) {
      res.status(404).json({ error: "Installer profile not found" });
      return;
    }
    const quotes = await prisma.quote.findMany({
      where: { installerId: installer.id },
      include: { homeowner: { select: { firstName: true, lastName: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });

    const redacted = quotes.map(q => ({
      ...q,
      homeowner: q.leadFeePaid
        ? q.homeowner
        : { firstName: q.homeowner.firstName, lastName: q.homeowner.lastName[0] + ".", email: null, phone: null },
    }));

    res.json(redacted);
  } catch {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

router.patch("/:id", authenticate, requireRole("INSTALLER", "HOMEOWNER"), validate(updateQuoteSchema), async (req: AuthRequest, res: Response) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: {
        homeowner: { select: { email: true, firstName: true } },
        installer: { select: { companyName: true } },
      },
    });
    if (!quote) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }

    const installer = req.user!.role === "INSTALLER"
      ? await prisma.installer.findUnique({ where: { userId: req.user!.userId } })
      : null;

    const isOwner = quote.homeownerId === req.user!.userId;
    const isInstaller = installer?.id === quote.installerId;
    if (!isOwner && !isInstaller) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    const updated = await prisma.quote.update({ where: { id: req.params.id }, data: req.body });

    // Notify homeowner when installer accepts or declines
    if (req.body.status === "ACCEPTED" || req.body.status === "DECLINED") {
      sendQuoteStatusEmail(
        quote.homeowner.email,
        quote.homeowner.firstName,
        quote.installer.companyName,
        req.body.status
      ).catch(() => {});
    }

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
});

export default router;
