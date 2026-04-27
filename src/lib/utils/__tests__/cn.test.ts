import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils/cn";

describe("cn", () => {
  it("merges class values", () => {
    expect(cn("px-2", "py-1", undefined, false && "hidden")).toBe("px-2 py-1");
  });

  it("resolves tailwind conflicts by keeping last class", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-base")).toBe("text-base");
  });
});
