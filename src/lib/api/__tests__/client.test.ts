import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient } from "@/lib/api/client";

describe("apiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends credentials include by default", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiClient<{ ok: boolean }>("/health");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
    });
  });

  it("injects locale and guest headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiClient<{ ok: boolean }>("/products", {
      locale: "bn",
      guestId: "guest-1",
    });

    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(options.headers);
    expect(headers.get("Accept-Language")).toBe("bn");
    expect(headers.get("X-Guest-Id")).toBe("guest-1");
  });

  it("throws ApiError on non-200 response", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ message: "Nope" }), { status: 400 })),
    );
    vi.stubGlobal("fetch", fetchMock);

    const error = await apiClient("/products").catch((err) => err);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      body: { message: "Nope" },
    });
  });
});
