import { describe, expect, it } from "vitest";
import {
  bestMatchId,
  expandLocalityMatchTargets,
  expandSubdivisionMatchTargets,
  firstMatchingId,
  normalizeName,
} from "./match-area";

describe("normalizeName", () => {
  it("lowercases and collapses spaces", () => {
    expect(normalizeName("  Dhaka  Division  ")).toBe("dhaka division");
  });
});

describe("bestMatchId", () => {
  const candidates = [
    { id: "a1", name: "Dhaka" },
    { id: "a2", name: "Chattogram" },
  ];

  it("returns exact match id", () => {
    expect(bestMatchId("Dhaka", candidates)).toBe("a1");
  });

  it("matches when hint contains candidate name", () => {
    expect(bestMatchId("Dhaka Division area", candidates)).toBe("a1");
  });

  it("matches when hint is a superstring of the area name", () => {
    expect(bestMatchId("Chattogram Division", candidates)).toBe("a2");
  });

  it("returns null for empty hint", () => {
    expect(bestMatchId("", candidates)).toBeNull();
  });

  it("returns null for empty list", () => {
    expect(bestMatchId("Dhaka", [])).toBeNull();
  });
});

describe("expandLocalityMatchTargets", () => {
  it("includes primary name and aliases as separate match rows", () => {
    const rows = expandLocalityMatchTargets([
      {
        id: "1",
        name: "Dhanmondi",
        code: null,
        geocodeMatchAliases: ["Dhanmondi Thana", "Dhanmondi TSO"],
      },
    ]);
    expect(rows.map((r) => r.name).sort()).toEqual(
      ["Dhanmondi", "Dhanmondi Thana", "Dhanmondi TSO"].sort(),
    );
    expect(rows.every((r) => r.id === "1")).toBe(true);
  });
});

describe("expandSubdivisionMatchTargets", () => {
  it("matches geocoder subdivision string to an alias when display name differs", () => {
    const subs = expandSubdivisionMatchTargets([
      {
        id: "s1",
        name: "Chattogram Division",
        code: null,
        geocodeMatchAliases: ["Chittagong Division", "Chattogram"],
      },
    ]);
    expect(bestMatchId("Chittagong Division", subs)).toBe("s1");
    expect(bestMatchId("Chattogram Division", subs)).toBe("s1");
  });
});

describe("firstMatchingId", () => {
  const locs = [
    { id: "x1", name: "Gulshan" },
    { id: "x2", name: "Dhanmondi" },
  ];

  it("uses the first hint that matches", () => {
    expect(firstMatchingId(["Unknown", "Dhanmondi"], locs)).toBe("x2");
  });

  it("skips empty hints", () => {
    expect(firstMatchingId(["", "  ", "Gulshan"], locs)).toBe("x1");
  });

  it("matches a geocoder string to a stored alias when display name differs", () => {
    const targets = expandLocalityMatchTargets([
      {
        id: "z1",
        name: "Official CMS Name",
        code: null,
        geocodeMatchAliases: ["OSM returns this"],
      },
    ]);
    expect(firstMatchingId(["OSM returns this"], targets)).toBe("z1");
    expect(firstMatchingId(["Official CMS Name"], targets)).toBe("z1");
  });
});
