import "dotenv/config";

const REQUIRED_ENV = ["JWT_SECRET", "JWT_REFRESH_SECRET", "DATABASE_URL"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k] || process.env[k]!.startsWith("REPLACE_"));
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(", ")}. Update backend/.env and restart.`);
  process.exit(1);
}

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { generalLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/auth";
import calculatorRoutes from "./routes/calculator";
import installerRoutes from "./routes/installers";
import quoteRoutes from "./routes/quotes";
import userRoutes from "./routes/users";
import passwordResetRoutes from "./routes/password-reset";
import paymentRoutes from "./routes/payments";

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'", "https://sandbox.payfast.co.za", "https://www.payfast.co.za"],
      upgradeInsecureRequests: isProd ? [] : null,
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(generalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/calculator", calculatorRoutes);
app.use("/api/installers", installerRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (isProd) {
    res.status(500).json({ error: "Internal server error" });
  } else {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`SolMatch API running on http://localhost:${PORT}`);
});
