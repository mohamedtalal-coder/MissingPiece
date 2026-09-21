import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { resolve } from "path";
import { Product } from "../features/products/product.model.js";
import { User } from "../features/auth/user.model.js";
import { FAQ } from "../features/faq/faq.model.js";

dotenv.config({ path: resolve(process.cwd(), ".env") });

const MONGO_URI = process.env["MONGO_URI"];

if (!MONGO_URI) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}

// This script wipes and re-seeds the products and FAQ collections. Never run
// it against production without FORCE_SEED=true — it is meant for local/dev
// and staging databases only.
if (process.env["NODE_ENV"] === "production" && process.env["FORCE_SEED"] !== "true") {
  console.error(
    "Refusing to run: NODE_ENV=production. Set FORCE_SEED=true if you really want to wipe production data."
  );
  process.exit(1);
}

/**
 * Real product images (Unsplash, "Unsplash License" — free for commercial
 * use, no attribution required: https://unsplash.com/license).
 *
 * Every ID below was verified by fetching the actual Unsplash photo page
 * and reading its confirmed CDN URL and license off the page — not guessed.
 * That's the difference from the first pass at this file, where invented
 * `photo-xxxx` IDs had no guarantee of pointing at a real photo.
 *
 * Caveat worth flagging: these are *stock* photos representing each
 * category (a chess board, a jigsaw puzzle, a wooden puzzle box, etc.),
 * not photos of your actual SKUs — and a few categories only had one or two
 * good free-licensed matches, so some products intentionally share an
 * image. Treat this as a strong placeholder tier above color blocks, not
 * final catalog photography. Swap in real product shots (e.g. via
 * Cloudinary, which is already wired up) as they become available —
 * nothing else needs to change since `images` is just a string array.
 */
function unsplash(...photoIds: string[]): string[] {
  return photoIds.map(
    (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`
  );
}

interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: "Wooden Puzzles" | "Jigsaw Puzzles" | "3D Puzzles" | "Mystery Puzzles";
  stock: number;
  images: string[];
}

const storeProducts: SeedProduct[] = [
  // --- Wooden Puzzles (chess sets & wooden brain teasers) ---
  {
    name: "Classic Wooden Chess Set",
    slug: "classic-wooden-chess-set",
    description:
      "A handcrafted classic wooden chess set with intricately carved pieces and a polished folding board. Perfect for beginners and grandmasters alike.",
    price: 49.99,
    category: "Wooden Puzzles",
    stock: 25,
    images: unsplash("1560011762-55f98b50772b", "1727572337756-7059053381e5"),
  },
  {
    name: "Handcrafted Rosewood Chess Pieces",
    slug: "handcrafted-rosewood-chess-pieces",
    description:
      "Set of 32 premium handcrafted chess pieces made from fine rosewood. Board not included. Double-weighted with felted bottoms for a satisfying feel.",
    price: 89.99,
    category: "Wooden Puzzles",
    stock: 20,
    images: unsplash("1727572337756-7059053381e5", "1560011762-55f98b50772b"),
  },
  {
    name: "Magnetic Travel Chess Set",
    slug: "magnetic-travel-chess-set",
    description:
      "A compact, lightweight magnetic chess set built for travel. Pieces stay exactly where you placed them, even on a bumpy ride.",
    price: 19.99,
    category: "Wooden Puzzles",
    stock: 50,
    images: unsplash("1560011762-55f98b50772b"),
  },
  {
    name: "Wooden Tangram Brain Teaser",
    slug: "wooden-tangram-brain-teaser",
    description:
      "Seven precisely cut wooden shapes that combine into thousands of silhouettes, from animals to letters. A pocket-sized classic for sharpening spatial thinking.",
    price: 14.99,
    category: "Wooden Puzzles",
    stock: 60,
    images: unsplash("1589495374906-b7f5ca5de879"),
  },

  // --- Jigsaw Puzzles ---
  {
    name: "1000-Piece Starry Night Jigsaw Puzzle",
    slug: "starry-night-jigsaw-puzzle",
    description:
      "Recreate Van Gogh's masterpiece with this challenging 1000-piece jigsaw puzzle, printed on premium glare-free paper with precise interlocking pieces.",
    price: 24.99,
    category: "Jigsaw Puzzles",
    stock: 40,
    // Generic jigsaw-puzzle photo, not a reproduction of the actual painting.
    images: unsplash("1586527155314-1d25428324ff"),
  },
  {
    name: "Abstract Art 500-Piece Puzzle",
    slug: "abstract-art-500-piece-puzzle",
    description:
      "A vibrant, colorful 500-piece puzzle featuring modern abstract art — a relaxed weekend project for solo or family puzzling.",
    price: 18.99,
    category: "Jigsaw Puzzles",
    stock: 35,
    images: unsplash("1494059980473-813e73ee784b"),
  },
  {
    name: "2000-Piece World Map Jigsaw Puzzle",
    slug: "2000-piece-world-map-jigsaw-puzzle",
    description:
      "A detailed 2000-piece world map puzzle with political borders, capitals, and ocean currents illustrated. A serious puzzle for serious puzzlers.",
    price: 32.99,
    category: "Jigsaw Puzzles",
    stock: 22,
    images: unsplash("1723306743407-cb6ac8f19941"),
  },

  // --- 3D Puzzles ---
  {
    name: "3D Wooden Globe Puzzle",
    slug: "3d-wooden-globe-puzzle",
    description:
      "A mechanical 3D wooden puzzle that assembles into a fully functional spinning globe. A satisfying STEM-style build for teens and adults.",
    price: 59.99,
    category: "3D Puzzles",
    stock: 15,
    images: unsplash("1569956726918-b36bd5e659b2"),
  },
  {
    name: "3D Wooden Model Ship Puzzle",
    slug: "3d-wooden-model-ship-puzzle",
    description:
      "Laser-cut wooden panels that snap together, no glue required, into a detailed tall-ship model. Includes numbered assembly instructions.",
    price: 44.99,
    category: "3D Puzzles",
    stock: 18,
    // No free-licensed wooden-ship-model photo turned up a good match;
    // reusing the architectural model shot as a generic "3D model" stand-in.
    images: unsplash("1730813379885-755a9997b458"),
  },
  {
    name: "Notre-Dame 3D Architectural Puzzle",
    slug: "notre-dame-3d-architectural-puzzle",
    description:
      "A museum-grade 3D architectural puzzle recreating Notre-Dame's facade in fine detail, built from precision die-cut cardstock panels.",
    price: 39.99,
    category: "3D Puzzles",
    stock: 12,
    // Generic architecture-model photo, not an actual photo of Notre-Dame.
    images: unsplash("1730813379885-755a9997b458"),
  },

  // --- Mystery Puzzles (puzzle games) ---
  {
    name: "Mystery Murder Case File Puzzle Game",
    slug: "mystery-murder-case-file-puzzle",
    description:
      "Solve a fictional murder mystery by examining evidence, reading witness statements, and connecting the dots. An immersive tabletop puzzle-game experience.",
    price: 34.99,
    category: "Mystery Puzzles",
    stock: 30,
    images: unsplash("1521225753516-46438a76f25a"),
  },
  {
    name: "The Vanishing Vault Escape Room Box",
    slug: "vanishing-vault-escape-room-box",
    description:
      "A self-contained escape-room-in-a-box with locks, hidden compartments, and a chain of puzzles that unravel a single evening's mystery.",
    price: 29.99,
    category: "Mystery Puzzles",
    stock: 28,
    images: unsplash("1564509845994-c82dac79099c"),
  },
  {
    name: "Cryptic Codebreaker Puzzle Box",
    slug: "cryptic-codebreaker-puzzle-box",
    description:
      "A locked wooden puzzle box that only opens once its sequence of hidden mechanisms and ciphers has been solved. No two solvers take the same path.",
    price: 27.99,
    category: "Mystery Puzzles",
    stock: 24,
    // Reusing the wooden-chest photo — this and the Vanishing Vault box were
    // the only two products where I couldn't find a second distinct,
    // free-licensed "puzzle box" photo.
    images: unsplash("1564509845994-c82dac79099c"),
  },
];

const faqData = [
  // --- Orders & Shipping ---
  {
    questionEn: "How long does shipping take?",
    questionAr: "كم تستغرق مدة الشحن؟",
    answerEn:
      "Standard orders ship within 1-2 business days and typically arrive within 3-7 business days, depending on your location. You'll receive a tracking link by email as soon as your order ships.",
    answerAr:
      "يتم شحن الطلبات القياسية خلال يوم إلى يومي عمل، وتصل عادةً خلال 3 إلى 7 أيام عمل حسب موقعك. ستصلك رسالة بريد إلكتروني تحتوي على رابط تتبع الشحنة فور شحن طلبك.",
    category: "Orders & Shipping",
    status: "published" as const,
    order: 1,
  },
  {
    questionEn: "Can I track my order?",
    questionAr: "هل يمكنني تتبع طلبي؟",
    answerEn:
      "Yes. Once your order ships, we email you a tracking number. You can also check the current status of any order from the Orders section of your account.",
    answerAr:
      "نعم. بمجرد شحن طلبك، سنرسل لك رقم التتبع عبر البريد الإلكتروني. يمكنك أيضًا مراجعة حالة أي طلب من قسم \"الطلبات\" في حسابك.",
    category: "Orders & Shipping",
    status: "published" as const,
    order: 2,
  },
  {
    questionEn: "Do you ship internationally?",
    questionAr: "هل تقومون بالشحن الدولي؟",
    answerEn:
      "We currently ship to a growing list of countries. Available destinations and their shipping costs are shown automatically at checkout based on your address.",
    answerAr:
      "نقوم حاليًا بالشحن إلى قائمة متنامية من الدول. تظهر الوجهات المتاحة وتكاليف الشحن الخاصة بها تلقائيًا عند إتمام الطلب بناءً على عنوانك.",
    category: "Orders & Shipping",
    status: "published" as const,
    order: 3,
  },

  // --- Products & Materials ---
  {
    questionEn: "What materials are your chess sets and puzzles made from?",
    questionAr: "ما هي الخامات المستخدمة في صناعة طقم الشطرنج والألغاز؟",
    answerEn:
      "Our wooden pieces — chess sets, tangrams, and 3D puzzles — are made from responsibly sourced hardwoods like rosewood and beech. Jigsaw puzzles use premium glare-free puzzle paper with precision-cut, interlocking pieces.",
    answerAr:
      "قطعنا الخشبية — أطقم الشطرنج، ألعاب التانجرام، والألغاز ثلاثية الأبعاد — مصنوعة من أخشاب صلبة مصدرها مسؤول مثل خشب الورد والزان. أما ألغاز الصور المقطوعة (Jigsaw) فتُصنع من ورق عالي الجودة غير عاكس للضوء بقطع دقيقة ومتشابكة.",
    category: "Products & Materials",
    status: "published" as const,
    order: 1,
  },
  {
    questionEn: "Are the puzzle pieces guaranteed to fit together?",
    questionAr: "هل قطع اللغز مضمونة التطابق مع بعضها؟",
    answerEn:
      "Every puzzle is quality-checked before packing. If a set arrives with a missing or damaged piece, contact us with your order number and we'll send a replacement or a free reprint at no cost.",
    answerAr:
      "يتم فحص جودة كل لغز قبل تغليفه. إذا وصلك طقم به قطعة مفقودة أو تالفة، تواصل معنا برقم طلبك وسنرسل لك قطعة بديلة أو نسخة جديدة مجانًا.",
    category: "Products & Materials",
    status: "published" as const,
    order: 2,
  },
  {
    questionEn: "What's the difference between the puzzle categories?",
    questionAr: "ما الفرق بين تصنيفات الألغاز المختلفة؟",
    answerEn:
      "Wooden Puzzles covers chess sets and wooden brain teasers, Jigsaw Puzzles are classic flat picture puzzles, 3D Puzzles build into standalone models, and Mystery Puzzles are our narrative puzzle games and escape-room boxes.",
    answerAr:
      "تضم \"الألغاز الخشبية\" أطقم الشطرنج والألغاز الخشبية الذهنية، و\"ألغاز الصور المقطوعة\" هي الألغاز المسطحة الكلاسيكية، وتتحول \"الألغاز ثلاثية الأبعاد\" إلى مجسمات قائمة بذاتها، بينما \"ألغاز الغموض\" هي ألعابنا القصصية وصناديق هروب الغرف.",
    category: "Products & Materials",
    status: "published" as const,
    order: 3,
  },

  // --- Payments ---
  {
    questionEn: "What payment methods do you accept?",
    questionAr: "ما هي طرق الدفع المتاحة؟",
    answerEn:
      "We accept all major credit and debit cards through our secure checkout. All payments are processed by Stripe — we never see or store your full card details.",
    answerAr:
      "نقبل جميع بطاقات الائتمان والخصم الرئيسية عبر صفحة الدفع الآمنة. تتم معالجة جميع المدفوعات من خلال Stripe — ولا نرى أو نخزن بيانات بطاقتك الكاملة أبدًا.",
    category: "Payments",
    status: "published" as const,
    order: 1,
  },
  {
    questionEn: "Is my payment information secure?",
    questionAr: "هل معلومات الدفع الخاصة بي آمنة؟",
    answerEn:
      "Yes. Checkout runs over an encrypted connection and card data is handled entirely by Stripe, a PCI-compliant payment processor. Our servers never store your card number.",
    answerAr:
      "نعم. تتم عملية الدفع عبر اتصال مشفّر، وتُعالج بيانات البطاقة بالكامل من خلال Stripe، وهي شركة معالجة مدفوعات متوافقة مع معايير PCI. خوادمنا لا تخزن رقم بطاقتك إطلاقًا.",
    category: "Payments",
    status: "published" as const,
    order: 2,
  },

  // --- Returns & Refunds ---
  {
    questionEn: "What is your return policy?",
    questionAr: "ما هي سياسة الإرجاع لديكم؟",
    answerEn:
      "Unopened items can be returned within 30 days of delivery for a full refund. If your puzzle or chess set arrived damaged, we'll cover a replacement or refund regardless of whether it's been opened.",
    answerAr:
      "يمكن إرجاع المنتجات غير المفتوحة خلال 30 يومًا من تاريخ التسليم لاسترداد كامل المبلغ. وإذا وصلك اللغز أو طقم الشطرنج تالفًا، سنتكفل باستبداله أو استرداد قيمته حتى لو تم فتحه.",
    category: "Returns & Refunds",
    status: "published" as const,
    order: 1,
  },
  {
    questionEn: "How do I start a return?",
    questionAr: "كيف أبدأ عملية إرجاع؟",
    answerEn:
      "Go to Orders in your account, select the order, and choose 'Request Return'. Our team will confirm by email and share the return address and next steps.",
    answerAr:
      "اذهب إلى قسم \"الطلبات\" في حسابك، اختر الطلب، ثم اضغط على \"طلب إرجاع\". سيقوم فريقنا بالتأكيد عبر البريد الإلكتروني ومشاركة عنوان الإرجاع والخطوات التالية.",
    category: "Returns & Refunds",
    status: "published" as const,
    order: 2,
  },

  // --- Account ---
  {
    questionEn: "Do I need an account to place an order?",
    questionAr: "هل أحتاج إلى إنشاء حساب لتقديم طلب؟",
    answerEn:
      "Yes, creating a free account lets you track orders, save addresses, and build a wishlist of the puzzles and chess sets you're eyeing next.",
    answerAr:
      "نعم، إنشاء حساب مجاني يتيح لك تتبع الطلبات، وحفظ العناوين، وإنشاء قائمة أمنيات بالألغاز وأطقم الشطرنج التي تفكر في اقتنائها لاحقًا.",
    category: "Account",
    status: "published" as const,
    order: 1,
  },
  {
    questionEn: "How do I reset my password?",
    questionAr: "كيف يمكنني إعادة تعيين كلمة المرور؟",
    answerEn:
      "Click 'Forgot password' on the login page and enter your email. We'll send a one-time code so you can set a new password in a couple of minutes.",
    answerAr:
      "اضغط على \"نسيت كلمة المرور\" في صفحة تسجيل الدخول وأدخل بريدك الإلكتروني. سنرسل لك رمزًا مؤقتًا لتتمكن من تعيين كلمة مرور جديدة خلال دقائق.",
    category: "Account",
    status: "published" as const,
    order: 2,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log("Connected to DB...");

    console.log("Clearing existing products...");
    await Product.deleteMany({});

    console.log("Seeding puzzle & chess store products...");
    await Product.insertMany(
      storeProducts.map((p) => ({
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        category: p.category,
        stock: p.stock,
        isActive: true,
        images: p.images,
      }))
    );
    console.log(`Seeded ${storeProducts.length} products.`);

    console.log("Clearing existing FAQs...");
    await FAQ.deleteMany({});

    console.log("Seeding bilingual FAQs (EN/AR)...");
    await FAQ.insertMany(faqData);
    console.log(`Seeded ${faqData.length} FAQs.`);

    const adminEmail = process.env["SEED_ADMIN_EMAIL"] || "admin@missingpiece.local";
    const adminPassword = process.env["SEED_ADMIN_PASSWORD"] || "ChangeMe123!";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await User.create({
        name: "Admin",
        email: adminEmail,
        passwordHash,
        role: "admin",
        isEmailVerified: true,
      });
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