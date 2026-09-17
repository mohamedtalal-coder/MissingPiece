import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  createReview,
  updateReview,
  deleteReview,
  listReviewsForProduct,
} from "./review.service.js";
import { Review } from "./review.model.js";
import { Product } from "../products/product.model.js";
import { User } from "../auth/user.model.js";
import { createReviewSchema, updateReviewSchema } from "./review.validation.js";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Review.deleteMany({});
  await Product.deleteMany({});
});

describe("Review Service", () => {
  let productId: string;
  const userId1 = new mongoose.Types.ObjectId().toString();
  const userId2 = new mongoose.Types.ObjectId().toString();

  beforeEach(async () => {
    const product = await Product.create({
      name: "Test Product",
      slug: "test-product",
      price: 10,
      category: "test",
      stock: 100,
    });
    productId = product._id.toString();
  });

  describe("Validation (Zod)", () => {
    it("rejects rating out of range", () => {
      const result1 = createReviewSchema.safeParse({ product: productId, rating: 0 });
      expect(result1.success).toBe(false);

      const result2 = createReviewSchema.safeParse({ product: productId, rating: 6 });
      expect(result2.success).toBe(false);

      const result3 = createReviewSchema.safeParse({ product: productId, rating: 4.5 });
      expect(result3.success).toBe(false);
    });

    it("accepts valid review payload", () => {
      const result = createReviewSchema.safeParse({
        product: productId,
        rating: 4,
        comment: "Great product",
      });
      expect(result.success).toBe(true);
    });

    it("accepts boundary ratings 1 and 5", () => {
      expect(createReviewSchema.safeParse({ product: productId, rating: 1, comment: "C" }).success).toBe(true);
      expect(createReviewSchema.safeParse({ product: productId, rating: 5, comment: "C" }).success).toBe(true);
    });
  });

  describe("createReview", () => {
    it("succeeds for a first review and recalculates rating", async () => {
      const review = await createReview(userId1, {
        product: productId,
        rating: 4,
        comment: "Nice",
      });
      expect(review.rating).toBe(4);
      expect(review.user.toString()).toBe(userId1);

      const product = await Product.findById(productId);
      expect(product?.averageRating).toBe(4);
      expect(product?.reviewCount).toBe(1);
    });

    it("throws 11000 on a second review by the same user for the same product", async () => {
      await createReview(userId1, { product: productId, rating: 4, comment: "First" });
      
      await expect(
        createReview(userId1, { product: productId, rating: 5, comment: "Second" })
      ).rejects.toThrow(/E11000/); // MongoDB duplicate key error
    });

    it("creating review for nonexistent product rejected with 404", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(
        createReview(userId1, { product: fakeId, rating: 5, comment: "C" })
      ).rejects.toThrow("Product not found");
    });
  });

  describe("updateReview", () => {
    let reviewId: string;

    beforeEach(async () => {
      const review = await createReview(userId1, {
        product: productId,
        rating: 3,
        comment: "Okay",
      });
      reviewId = review._id.toString();
    });

    it("succeeds for the review's owner and recalculates rating", async () => {
      await updateReview(reviewId, userId1, false, { rating: 5, comment: "Better" });
      const product = await Product.findById(productId);
      expect(product?.averageRating).toBe(5);
    });

    it("throws 403 for a different authenticated user", async () => {
      await expect(
        updateReview(reviewId, userId2, false, { rating: 1 })
      ).rejects.toThrow("Not authorized to edit this review");
    });

    it("succeeds for an admin regardless of ownership", async () => {
      await updateReview(reviewId, userId2, true, { rating: 4 });
      const product = await Product.findById(productId);
      expect(product?.averageRating).toBe(4);
    });
  });

  describe("deleteReview", () => {
    let reviewId: string;

    beforeEach(async () => {
      const review = await createReview(userId1, {
        product: productId,
        rating: 3,
        comment: "Okay",
      });
      reviewId = review._id.toString();
    });

    it("succeeds for the review's owner and recalculates rating", async () => {
      await deleteReview(reviewId, userId1, false);
      const product = await Product.findById(productId);
      expect(product?.averageRating).toBe(0);
      expect(product?.reviewCount).toBe(0);
    });

    it("throws 403 for a different authenticated user", async () => {
      await expect(
        deleteReview(reviewId, userId2, false)
      ).rejects.toThrow("Not authorized to edit this review");
    });

    it("succeeds for an admin regardless of ownership", async () => {
      await deleteReview(reviewId, userId2, true);
      const product = await Product.findById(productId);
      expect(product?.averageRating).toBe(0);
      expect(product?.reviewCount).toBe(0);
    });
  });

  describe("recalculateProductRating", () => {
    it("produces correct average after multiple reviews and resets to 0/0 when last deleted", async () => {
      await createReview(userId1, { product: productId, rating: 5, comment: "User 1" });
      await createReview(userId2, { product: productId, rating: 4, comment: "User 2" });

      let product = await Product.findById(productId);
      expect(product?.averageRating).toBe(4.5);
      expect(product?.reviewCount).toBe(2);

      const review2 = await Review.findOne({ user: userId2 });
      await deleteReview(review2!._id.toString(), userId2, false);

      product = await Product.findById(productId);
      expect(product?.averageRating).toBe(5);
      expect(product?.reviewCount).toBe(1);

      const review1 = await Review.findOne({ user: userId1 });
      await deleteReview(review1!._id.toString(), userId1, false);

      product = await Product.findById(productId);
      expect(product?.averageRating).toBe(0);
      expect(product?.reviewCount).toBe(0);
    });
  });

  describe("listReviewsForProduct", () => {
    it("paginates and populates reviewer name only (no email/passwordHash)", async () => {
      // create a user to populate
      const u = await User.create({ name: "Rev User", email: "rev@e.com", passwordHash: "secret" });

      await createReview(u._id.toString(), { product: productId, rating: 4, comment: "C1" });
      
      const result = await listReviewsForProduct({ product: productId, page: 1, limit: 10 });
      expect(result.reviews.length).toBe(1);
      
      const reviewUser = result.reviews[0]!.user as any;
      expect(reviewUser.name).toBe("Rev User");
      expect(reviewUser.email).toBeUndefined();
      expect(reviewUser.passwordHash).toBeUndefined();
    });
  });
});
