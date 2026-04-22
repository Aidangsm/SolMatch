import { Router, Request, Response } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { calculatorLimiter } from "../middleware/rateLimiter";
import { calculateROI } from "../utils/roi";

const router = Router();

const calcSchema = z.object({
  monthlyBill: z.number().min(100).max(100000),
  includesBattery: z.boolean().optional().default(false),
});

router.post("/", calculatorLimiter, validate(calcSchema), (req: Request, res: Response) => {
  const result = calculateROI(req.body);
  res.json(result);
});

export default router;
