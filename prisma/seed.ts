import { PrismaClient, DiscountType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sarees = await prisma.category.upsert({
    where: { slug: "sarees" },
    update: {},
    create: { name: "Sarees", slug: "sarees", description: "Celebratory drapes and occasion silhouettes." }
  });

  const coords = await prisma.category.upsert({
    where: { slug: "co-ord-sets" },
    update: {},
    create: { name: "Co-ord Sets", slug: "co-ord-sets", description: "Tailored sets with heritage cues." }
  });

  const heritage = await prisma.collection.upsert({
    where: { slug: "aurangabad-heritage" },
    update: {},
    create: {
      name: "Aurangabad Heritage",
      slug: "aurangabad-heritage",
      description: "Textural silhouettes inspired by Himroo and Paithani."
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@rukhsar.in" },
    update: {},
    create: {
      fullName: "Rukhsar Admin",
      email: "admin@rukhsar.in",
      passwordHash: "replace-with-bcrypt-hash",
      role: UserRole.ADMIN,
      isVerified: true
    }
  });

  const noor = await prisma.product.upsert({
    where: { slug: "noor-himroo-jacket-set" },
    update: {},
    create: {
      name: "Noor Himroo Jacket Set",
      slug: "noor-himroo-jacket-set",
      shortDescription: "A modern co-ord framed by heritage Himroo texture.",
      longDescription: "Festive layered set balancing structure, ease, and artisan finish.",
      sku: "RUK-NOOR-BASE",
      categoryId: coords.id,
      collectionId: heritage.id,
      basePrice: 7499,
      salePrice: 6799,
      fabric: "Himroo Blend",
      color: "Deep Maroon",
      careInstructions: "Dry clean only",
      sizeGuide: "XS-XL regular fit",
      isFeatured: true,
      seoTitle: "Noor Himroo Jacket Set | Rukhsar",
      seoDescription: "Premium festive co-ord inspired by Aurangabad Himroo craft."
    }
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: noor.id,
        url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
        altText: "Noor Himroo Jacket Set"
      }
    ],
    skipDuplicates: true
  });

  await prisma.productVariant.upsert({
    where: { sku: "RUK-NOOR-M-MAR" },
    update: {},
    create: {
      productId: noor.id,
      size: "M",
      color: "Deep Maroon",
      stock: 5,
      sku: "RUK-NOOR-M-MAR"
    }
  });

  await prisma.product.upsert({
    where: { slug: "paithani-bloom-saree" },
    update: {},
    create: {
      name: "Paithani Bloom Saree",
      slug: "paithani-bloom-saree",
      shortDescription: "A celebratory drape with luminous woven motifs.",
      longDescription: "Wedding guest and festive saree in saffron gold tones.",
      sku: "RUK-PAI-BASE",
      categoryId: sarees.id,
      collectionId: heritage.id,
      basePrice: 11299,
      salePrice: 9999,
      fabric: "Silk Blend",
      color: "Saffron Gold",
      careInstructions: "Dry clean only",
      sizeGuide: "Free size saree",
      isFeatured: true
    }
  });

  await prisma.coupon.upsert({
    where: { code: "AURANGABAD10" },
    update: {},
    create: {
      code: "AURANGABAD10",
      description: "10% off above Rs. 5,000",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minOrderValue: 5000,
      maxDiscount: 2000,
      validFrom: new Date("2026-04-01T00:00:00.000Z"),
      validTo: new Date("2026-12-31T23:59:59.000Z"),
      isActive: true
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
