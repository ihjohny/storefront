import { describe, expect, it } from "vitest";
import { getCategories, getCategoryBySlug, getTopLevelCategories } from "../categories";

describe("categories API helpers", () => {
  it("getCategories returns active categories from MSW", async () => {
    const list = await getCategories("en");
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]?.slug).toBe("mock-category");
  });

  it("getTopLevelCategories filters to root categories", async () => {
    const top = await getTopLevelCategories("en");
    expect(top.every((c) => !c.parent)).toBe(true);
  });

  it("getCategoryBySlug resolves by slug", async () => {
    const cat = await getCategoryBySlug("mock-category", "en");
    expect(cat?.name).toBe("Mock Category");
    expect(await getCategoryBySlug("missing", "en")).toBeNull();
  });
});
