import { Router, Request, Response } from "express";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { generalLimiter } from "../middleware/rateLimiter";

function sanitize(input: unknown): unknown {
  if (typeof input === "string") return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
  if (Array.isArray(input)) return input.map(sanitize);
  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).map(([k, v]) => [k, sanitize(v)]));
  }
  return input;
}

const router = Router();

const SA_PROVINCES = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"] as const;

const createInstallerSchema = z.object({
  companyName: z.string().min(2).max(100),
  registrationNo: z.string().optional(),
  vatNo: z.string().optional(),
  description: z.string().max(1000).optional(),
  province: z.enum(SA_PROVINCES),
  city: z.string().min(2).max(100),
  address: z.string().optional(),
  phone: z.string().min(10).max(20),
  email: z.string().email(),
  website: z.string().url().optional().or(z.literal("")),
  yearsExperience: z.number().int().min(0).max(50).default(0),
  systemTypes: z.array(z.enum(["residential","commercial","off-grid","hybrid"])).default([]),
  certifications: z.array(z.string()).default([]),
  minSystemSize: z.number().optional(),
  maxSystemSize: z.number().optional(),
  priceRangeMin: z.number().optional(),
  priceRangeMax: z.number().optional(),
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  reviewerName: z.string().min(1).max(100),
});

// List installers with filters
router.get("/", generalLimiter, async (req: Request, res: Response) => {
  try {
    const { province, city, minKw, maxKw, verified, page = "1", limit = "12" } = req.query;

    const where: Record<string, unknown> = {};
    if (province) where.province = province;
    if (city) where.city = { contains: city as string };
    if (verified === "true") where.verified = true;
    if (minKw) where.maxSystemSize = { gte: Number(minKw) };
    if (maxKw) where.minSystemSize = { lte: Number(maxKw) };

    const skip = (Number(page) - 1) * Number(limit);

    const [installers, total] = await Promise.all([
      prisma.installer.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [{ badgeActive: "desc" }, { avgRating: "desc" }],
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      prisma.installer.count({ where }),
    ]);

    res.json({
      installers: installers.map((i) => ({
        ...i,
        systemTypes: JSON.parse(i.systemTypes),
        certifications: JSON.parse(i.certifications),
      })),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch installers" });
  }
});

// Get single installer
router.get("/:id", generalLimiter, async (req: Request, res: Response) => {
  try {
    const installer = await prisma.installer.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { firstName: true, lastName: true, createdAt: true } },
        reviews: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    if (!installer) {
      res.status(404).json({ error: "Installer not found" });
      return;
    }
    res.json({
      ...installer,
      systemTypes: JSON.parse(installer.systemTypes),
      certifications: JSON.parse(installer.certifications),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch installer" });
  }
});

// Create installer profile (installer user only)
router.post("/", authenticate, requireRole("INSTALLER"), validate(createInstallerSchema), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.installer.findUnique({ where: { userId: req.user!.userId } });
    if (existing) {
      res.status(409).json({ error: "Installer profile already exists" });
      return;
    }
    const clean = sanitize(req.body) as typeof req.body;
    const installer = await prisma.installer.create({
      data: {
        ...clean,
        userId: req.user!.userId,
        systemTypes: JSON.stringify(clean.systemTypes),
        certifications: JSON.stringify(clean.certifications),
      },
    });
    res.status(201).json(installer);
  } catch {
    res.status(500).json({ error: "Failed to create installer profile" });
  }
});

// Update installer profile
router.put("/:id", authenticate, requireRole("INSTALLER", "ADMIN"), async (req: AuthRequest, res: Response) => {
  try {
    const installer = await prisma.installer.findUnique({ where: { id: req.params.id } });
    if (!installer) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (installer.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Not your profile" });
      return;
    }
    const updated = await prisma.installer.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        systemTypes: req.body.systemTypes ? JSON.stringify(req.body.systemTypes) : undefined,
        certifications: req.body.certifications ? JSON.stringify(req.body.certifications) : undefined,
      },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
});

// Add review
router.post("/:id/reviews", authenticate, validate(reviewSchema), async (req: AuthRequest, res: Response) => {
  try {
    const installer = await prisma.installer.findUnique({ where: { id: req.params.id } });
    if (!installer) {
      res.status(404).json({ error: "Installer not found" });
      return;
    }
    const review = await prisma.review.create({
      data: { installerId: req.params.id, ...req.body },
    });
    // Recalculate avg rating
    const agg = await prisma.review.aggregate({
      where: { installerId: req.params.id },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.installer.update({
      where: { id: req.params.id },
      data: { avgRating: agg._avg.rating ?? 0, totalReviews: agg._count },
    });
    res.status(201).json(review);
  } catch {
    res.status(500).json({ error: "Failed to add review" });
  }
});

export default router;
