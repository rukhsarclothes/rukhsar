import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const candidateEnvPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), "../../../.env"),
  path.resolve(__dirname, "../../../../.env")
];

if (process.env.NODE_ENV !== "production") {
  for (const envPath of candidateEnvPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: false });
      break;
    }
  }
}

function parseOrigins(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isWeakSecret(value: string, weakValues: string[]) {
  return value.length < 32 || weakValues.includes(value);
}

function assertProductionEnv() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing = [
    ["JWT_SECRET", process.env.JWT_SECRET],
    ["JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET],
    ["NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL]
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }

  if (isWeakSecret(process.env.JWT_SECRET ?? "", ["replace-me"])) {
    throw new Error("JWT_SECRET must be a strong production secret with at least 32 characters");
  }

  if (isWeakSecret(process.env.JWT_REFRESH_SECRET ?? "", ["replace-me-too"])) {
    throw new Error("JWT_REFRESH_SECRET must be a strong production secret with at least 32 characters");
  }

  if ((process.env.RAZORPAY_KEY_ID ?? "").startsWith("rzp_test_")) {
    throw new Error("Production is configured with a Razorpay test key. Use live keys before launch.");
  }

  if (!process.env.API_ALLOWED_ORIGINS && !process.env.NEXT_PUBLIC_SITE_URL) {
    throw new Error("Set API_ALLOWED_ORIGINS or NEXT_PUBLIC_SITE_URL for production CORS");
  }
}

assertProductionEnv();

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const allowedOrigins = Array.from(
  new Set([
    siteUrl,
    ...parseOrigins(process.env.API_ALLOWED_ORIGINS),
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://localhost:3005"])
  ])
);

if (process.env.NODE_ENV === "production") {
  const localOrigins = allowedOrigins.filter((origin) => {
    try {
      const hostname = new URL(origin).hostname;
      return hostname === "localhost" || hostname === "127.0.0.1";
    } catch {
      return true;
    }
  });

  if (localOrigins.length > 0) {
    throw new Error(`Production CORS origins must be deployed HTTPS origins, not: ${localOrigins.join(", ")}`);
  }
}

function isFileStoreAllowedInProduction() {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return process.env.ALLOW_FILE_STORE_IN_PRODUCTION === "true";
}

if (!isFileStoreAllowedInProduction()) {
  throw new Error(
    "Production cannot run on JSON file storage. Configure a transactional database-backed store before launch, or explicitly set ALLOW_FILE_STORE_IN_PRODUCTION=true only for a non-customer demo."
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "replace-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "replace-me-too",
  siteUrl,
  allowedOrigins,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
  storageProvider: process.env.STORAGE_PROVIDER ?? "json-file"
};
