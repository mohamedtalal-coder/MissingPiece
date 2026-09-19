import { describe, expect, it } from "@jest/globals";
import { resolveCategoryFilter } from "../../../features/products/product.service.js";

describe("product category filters", () => {
  it.each([
    ["jigsaw", ["jigsaw", "puzzle", "Jigsaw Puzzles"]],
    ["3d", ["3d", "3d-puzzle", "3D Puzzles", "3D Architectural"]],
    ["wooden", ["wooden", "chess", "Wooden Puzzles"]],
    ["mystery", ["mystery", "puzzle-game", "Mystery Puzzles"]],
  ])("maps %s to compatible stored categories", (slug, categories) => {
    expect(resolveCategoryFilter(slug)).toEqual({ $in: categories });
  });

  it("leaves custom categories unchanged", () => {
    expect(resolveCategoryFilter("limited-edition")).toBe("limited-edition");
  });
});