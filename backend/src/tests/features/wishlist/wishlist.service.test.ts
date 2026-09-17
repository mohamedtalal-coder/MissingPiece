import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { User } from "../../../features/auth/user.model.js";
import { Product } from "../../../features/products/product.model.js";
import { addProductToWishlist, removeProductFromWishlist, getUserWishlist } from "../../../features/wishlist/wishlist.service.js";
import { registerUser } from "../../../features/auth/auth.service.js";

let mongoServer: MongoMemoryServer;
let userId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  process.env["JWT_SECRET"] = "test-secret";
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  const res = await registerUser("Wishlist User", "wishlist@example.com", "Password123!");
  userId = res.user.id.toString();
});

describe("Wishlist Service", () => {
  describe("addProductToWishlist", () => {
    it("adds a product and doesn't duplicate", async () => {
      const p = await Product.create({ name: "P1", slug: "p1", description: "D", price: 10, category: "cat", stock: 10 });
      const pid = p._id.toString();

      let list = await addProductToWishlist(userId, pid);
      expect(list.length).toBe(1);

      list = await addProductToWishlist(userId, pid);
      expect(list.length).toBe(1); // no duplicate
    });

    it("rejects nonexistent product", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(addProductToWishlist(userId, fakeId)).rejects.toThrow("Product not found");
    });
  });

  describe("removeProductFromWishlist", () => {
    it("removes a product, no-op if not present", async () => {
      const p = await Product.create({ name: "P1", slug: "p1", description: "D", price: 10, category: "cat", stock: 10 });
      const pid = p._id.toString();
      
      await addProductToWishlist(userId, pid);
      let list = await removeProductFromWishlist(userId, pid);
      expect(list.length).toBe(0);

      list = await removeProductFromWishlist(userId, pid);
      expect(list.length).toBe(0);
    });
  });

  describe("getUserWishlist", () => {
    it("returns populated product details", async () => {
      const p = await Product.create({ name: "Populated", slug: "pop", description: "D", price: 10, category: "cat", stock: 10 });
      await addProductToWishlist(userId, p._id.toString());
      
      const list = await getUserWishlist(userId);
      expect(list.length).toBe(1);
      expect((list[0] as unknown as { name: string }).name).toBe("Populated");
    });
  });
});
