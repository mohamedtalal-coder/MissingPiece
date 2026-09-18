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

const storeProducts = [
  {
    name: "Classic Wooden Chess Set",
    slug: "classic-wooden-chess-set",
    description: "A beautifully handcrafted classic wooden chess set featuring intricately carved pieces and a polished folding board. Perfect for both beginners and grandmasters.",
    price: 49.99,
    images: ["https://images.unsplash.com/photo-1586165368502-1bad197a6461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    category: "chess",
    stock: 25,
    isActive: true,
  },
  {
    name: "Luxury Marble Chess Board",
    slug: "luxury-marble-chess-board",
    description: "An exquisite luxury chess set made from genuine black and white marble. This heavyweight set serves as a stunning centerpiece for any living room.",
    price: 149.99,
    images: ["https://images.unsplash.com/photo-1610889556528-9a770e32642f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    category: "chess",
    stock: 10,
    isActive: true,
  },
  {
    name: "1000-Piece Starry Night Jigsaw Puzzle",
    slug: "starry-night-jigsaw-puzzle",
    description: "Recreate Vincent van Gogh's masterpiece with this challenging 1000-piece jigsaw puzzle. Made with premium, glare-free paper and precise interlocking pieces.",
    price: 24.99,
    images: ["https://images.unsplash.com/photo-1550747545-c896b5b548ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    category: "puzzle",
    stock: 40,
    isActive: true,
  },
  {
    name: "3D Wooden Globe Puzzle",
    slug: "3d-wooden-globe-puzzle",
    description: "A mechanical 3D wooden puzzle that builds into a fully functional spinning globe. A perfect STEM gift for adults and teenagers.",
    price: 59.99,
    images: ["https://images.unsplash.com/photo-1512411030006-258162d0800e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    category: "3d-puzzle",
    stock: 15,
    isActive: true,
  },
  {
    name: "Magnetic Travel Chess Set",
    slug: "magnetic-travel-chess-set",
    description: "A compact, lightweight magnetic chess set ideal for traveling. Ensures your pieces stay exactly where you placed them, even on bumpy rides.",
    price: 19.99,
    images: ["https://images.unsplash.com/photo-1529699211952-734e80c4d42b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    category: "chess",
    stock: 50,
    isActive: true,
  },
  {
    name: "Abstract Art 500-Piece Puzzle",
    slug: "abstract-art-500-piece-puzzle",
    description: "A vibrant and colorful 500-piece puzzle featuring modern abstract art. A great way to relax and engage your mind.",
    price: 18.99,
    images: ["https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    category: "puzzle",
    stock: 35,
    isActive: true,
  },
  {
    name: "Handcrafted Rosewood Chess Pieces",
    slug: "handcrafted-rosewood-chess-pieces",
    description: "Set of 32 premium handcrafted chess pieces made from fine rosewood. Board not included. Features double weighting and felted bottoms.",
    price: 89.99,
    images: ["https://images.unsplash.com/photo-1580541832626-2a7131ee809f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    category: "chess",
    stock: 20,
    isActive: true,
  },
  {
    name: "Mystery Murder Case File Puzzle Game",
    slug: "mystery-murder-case-file-puzzle",
    description: "Solve a fictional murder mystery by examining evidence, reading witness statements, and connecting the dots. An immersive puzzle game experience.",
    price: 34.99,
    images: ["https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    category: "puzzle-game",
    stock: 30,
    isActive: true,
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log("Connected to DB...");

    console.log("Clearing all existing products...");
    await Product.deleteMany({});

    console.log("Seeding new store products...");
    await Product.insertMany(storeProducts);

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
