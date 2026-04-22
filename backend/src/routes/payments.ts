import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/authenticate";
import { buildPaymentParams, PAYFAST_URL, verifyITN } from "../lib/payfast";
import { sendQuoteStatusEmail } from "../lib/email";

const router = Router();

const LEAD_FEE = Number(process.env.LEAD_FEE_ZAR) || 500;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Installer initiates payment for a lead fee
router.post("/lead/:quoteId", authenticate, requireRole("INSTALLER"), async (req: AuthRequest, res: Response) => {
  try {
    const installer = await prisma.installer.findUnique({ where: { userId: req.user!.userId } });
    if (!installer) {
      res.status(404).json({ error: "Installer profile not found" });
      return;
    }

    const quote = await prisma.quote.findUnique({ where: { id: req.params.quoteId } });
    if (!quote || quote.installerId !== installer.id) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }
    if (quote.status !== "PENDING") {
      res.status(400).json({ error: "Quote is no longer pending" });
      return;
    }
    if (quote.leadFeePaid) {
      res.status(400).json({ error: "Lead fee already paid for this quote" });
      return;
    }

    const payment = await prisma.payment.create({
      data: { quoteId: quote.id, installerId: installer.id, amount: LEAD_FEE },
    });

    const params = buildPaymentParams({
      paymentId: payment.id,
      amount: LEAD_FEE,
      itemName: `SolMatch Lead Fee - ${quote.city} ${quote.systemSizeKw}kW`,
      returnUrl: `${FRONTEND_URL}/installer-dashboard?payment=success&quoteId=${quote.id}`,
      cancelUrl: `${FRONTEND_URL}/installer-dashboard?payment=cancelled`,
      notifyUrl: `${BACKEND_URL}/api/payments/itn`,
    });

    res.json({ url: PAYFAST_URL(), params });
  } catch {
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// PayFast ITN webhook — no auth, must be publicly reachable in production
router.post("/itn", async (req: Request, res: Response) => {
  // PayFast requires 200 before we process
  res.status(200).end();

  try {
    const pfData: Record<string, string> = req.body;
    const valid = await verifyITN(pfData);
    if (!valid) return;

    const { m_payment_id, payment_status, pf_payment_id } = pfData;
    if (payment_status !== "COMPLETE") return;

    const payment = await prisma.payment.findUnique({ where: { id: m_payment_id } });
    if (!payment || payment.status === "PAID") return;

    await prisma.payment.update({
      where: { id: m_payment_id },
      data: { status: "PAID", pfPaymentId: pf_payment_id },
    });

    const quote = await prisma.quote.update({
      where: { id: payment.quoteId },
      data: { status: "ACCEPTED", leadFeePaid: true },
      include: {
        homeowner: { select: { email: true, firstName: true } },
        installer: { select: { companyName: true } },
      },
    });

    sendQuoteStatusEmail(
      quote.homeowner.email,
      quote.homeowner.firstName,
      quote.installer.companyName,
      "ACCEPTED"
    ).catch(() => {});
  } catch {
    // Already sent 200 — log silently
  }
});

export default router;
