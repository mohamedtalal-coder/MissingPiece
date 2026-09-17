import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../features/products/product.model.js";
import { User } from "../features/auth/user.model.js";
import bcrypt from "bcrypt";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}

const puzzlePieces = Array.from({ length: 20 }, (_, i) => ({
  name: `Premium Wooden Puzzle Piece ${i + 1}`,
  slug: `premium-wooden-puzzle-piece-${i + 1}`,
  description: `A beautifully crafted premium wooden puzzle piece to add to your collection. Made from high-quality sustainable oak, this piece number ${i + 1} features intricate designs and a perfect interlocking mechanism.`,
  price: Math.floor(Math.random() * 20) + 10 + 0.99, // Random price between 10.99 and 29.99
  images: [
    `https://picsum.photos/seed/puzzle${i + 1}/600/600`, // Placeholder image
  ],
  category: "wooden",
  stock: Math.floor(Math.random() * 50) + 5, // Random stock between 5 and 54
  isActive: true,
}));

async function seed() {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log("Connected to DB...");

    console.log("Clearing existing wooden puzzle products...");
    await Product.deleteMany({ category: "wooden" });

    console.log("Seeding 20 new puzzle products...");
    await Product.insertMany(puzzlePieces);

    const adminEmail = process.env["SEED_ADMIN_EMAIL"] || "admin@missingpiece.local";
    const adminPassword = process.env["SEED_ADMIN_PASSWORD"] || "ChangeMe123!";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await User.create({ name: "Admin", email: adminEmail, passwordHash, role: "admin" });
      console.log(`Seeded admin user: ${adminEmail}. Please change this password after your first login!`);
    } else {
      console.log("Admin user already exists, skipping.");
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seed();
