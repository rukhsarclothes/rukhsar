import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { z } from "zod";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const partnerApplicationsPath = path.resolve(__dirname, "../../../data/partner-applications.json");
const partnerCatalogsDirectory = path.resolve(__dirname, "../../../tmp/partner-catalogs");

const partnerApplicationSchema = z.object({
  fullName: z.string().min(2),
  businessName: z.string().min(2),
  phoneNumber: z.string().min(10),
  email: z.string().email(),
  cityState: z.string().min(2),
  businessType: z.enum(["manufacturer", "wholesaler", "boutique-owner", "handloom-artisan", "other"]),
  productTypes: z.array(z.string()).min(1),
  monthlyInventoryCapacity: z.string().min(1),
  message: z.string().max(1200).optional().default("")
});

type PartnerApplicationRecord = z.infer<typeof partnerApplicationSchema> & {
  id: string;
  submittedAt: string;
  catalogFileName: string | null;
  catalogMimeType: string | null;
  catalogSize: number | null;
  catalogStoragePath: string | null;
};

function readPartnerApplications() {
  if (!fs.existsSync(partnerApplicationsPath)) {
    return [] as PartnerApplicationRecord[];
  }

  const raw = fs.readFileSync(partnerApplicationsPath, "utf8");
  return JSON.parse(raw) as PartnerApplicationRecord[];
}

function writePartnerApplications(records: PartnerApplicationRecord[]) {
  fs.writeFileSync(partnerApplicationsPath, JSON.stringify(records, null, 2));
}

router.post("/apply", upload.single("catalog"), (request, response) => {
  const productTypesInput = request.body.productTypes;
  let parsedProductTypes: unknown[] = [];

  if (typeof productTypesInput === "string") {
    try {
      parsedProductTypes = JSON.parse(productTypesInput) as unknown[];
    } catch {
      parsedProductTypes = productTypesInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  } else if (Array.isArray(productTypesInput)) {
    parsedProductTypes = productTypesInput;
  }

  const payload = partnerApplicationSchema.safeParse({
    fullName: request.body.fullName,
    businessName: request.body.businessName,
    phoneNumber: request.body.phoneNumber,
    email: request.body.email,
    cityState: request.body.cityState,
    businessType: request.body.businessType,
    productTypes: parsedProductTypes,
    monthlyInventoryCapacity: request.body.monthlyInventoryCapacity,
    message: request.body.message
  });

  if (!payload.success) {
    response.status(400).json({
      success: false,
      message: "Please complete all required partner application fields correctly."
    });
    return;
  }

  let catalogStoragePath: string | null = null;
  if (request.file) {
    fs.mkdirSync(partnerCatalogsDirectory, { recursive: true });
    const safeFileName = request.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storedFileName = `${Date.now()}-${safeFileName}`;
    catalogStoragePath = path.resolve(partnerCatalogsDirectory, storedFileName);
    fs.writeFileSync(catalogStoragePath, request.file.buffer);
  }

  const application: PartnerApplicationRecord = {
    id: `partner-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    ...payload.data,
    catalogFileName: request.file?.originalname ?? null,
    catalogMimeType: request.file?.mimetype ?? null,
    catalogSize: request.file?.size ?? null,
    catalogStoragePath
  };

  const currentApplications = readPartnerApplications();
  currentApplications.unshift(application);
  writePartnerApplications(currentApplications);

  response.status(201).json({
    success: true,
    message: "Application submitted successfully. Our partner team will reach out shortly.",
    item: {
      id: application.id,
      submittedAt: application.submittedAt
    }
  });
});

export { router as partnersRouter };
