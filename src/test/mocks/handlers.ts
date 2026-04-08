import { http, HttpResponse } from "msw";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

function apiRoot() {
  return new URL(API_URL.endsWith("/") ? API_URL : `${API_URL}/`);
}

function isApiCollection(request: Request, collection: string): boolean {
  try {
    const u = new URL(request.url);
    const root = apiRoot();
    if (u.origin !== root.origin) return false;
    const basePath = root.pathname.replace(/\/$/, "");
    return u.pathname === `${basePath}/${collection}`;
  } catch {
    return false;
  }
}

function isApiItem(request: Request, collection: string): boolean {
  try {
    const u = new URL(request.url);
    const root = apiRoot();
    if (u.origin !== root.origin) return false;
    const basePath = root.pathname.replace(/\/$/, "");
    const re = new RegExp(`^${basePath}/${collection}/[^/]+$`);
    return re.test(u.pathname);
  } catch {
    return false;
  }
}

const emptyPage = {
  hasNextPage: false,
  hasPrevPage: false,
  limit: 12,
  nextPage: null,
  page: 1,
  pagingCounter: 1,
  prevPage: null,
  totalDocs: 0,
  totalPages: 0,
};

export const handlers = [
  http.get(({ request }) => isApiCollection(request, "products"), ({ request }) => {
    const u = new URL(request.url);
    const slugEq = u.searchParams.get("where[slug][equals]");
    const doc = {
      id: "p1",
      name: "Mock Product",
      slug: "mock-product",
      basePrice: 29.99,
      currency: "USD",
      images: [],
      status: "published",
    };
    if (slugEq && slugEq !== doc.slug) {
      return HttpResponse.json({
        ...emptyPage,
        docs: [],
        limit: 1,
      });
    }
    return HttpResponse.json({
      docs: [doc],
      totalDocs: 1,
      limit: slugEq ? 1 : 12,
      totalPages: 1,
      page: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
      pagingCounter: 1,
    });
  }),
  http.get(({ request }) => isApiCollection(request, "categories"), () =>
    HttpResponse.json({
      docs: [
        {
          id: "c1",
          name: "Mock Category",
          slug: "mock-category",
          parent: null,
          displayOrder: 0,
          isActive: true,
        },
      ],
      totalDocs: 1,
      limit: 100,
      totalPages: 1,
      page: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
      pagingCounter: 1,
    }),
  ),
  http.get(({ request }) => isApiCollection(request, "carts"), ({ request }) => {
    const u = new URL(request.url);
    const guest = u.searchParams.get("where[guestId][equals]");
    const user = u.searchParams.get("where[user][equals]");
    if (!guest && !user) {
      return HttpResponse.json({ ...emptyPage, docs: [] });
    }
    return HttpResponse.json({
      docs: [
        {
          id: "cart-msw-1",
          guestId: guest ?? undefined,
          items: [
            {
              id: "li1",
              quantity: 1,
              product: { id: "p1", name: "Mock Product", slug: "mock-product", basePrice: 10 },
            },
          ],
        },
      ],
      totalDocs: 1,
      limit: 1,
      totalPages: 1,
      page: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
      pagingCounter: 1,
    });
  }),
  http.post(({ request }) => isApiCollection(request, "carts"), async ({ request }) => {
    const body = (await request.json()) as { items?: unknown[] };
    return HttpResponse.json({
      doc: {
        id: "cart-new",
        items: body.items ?? [],
      },
    });
  }),
  http.patch(({ request }) => isApiItem(request, "carts"), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    return HttpResponse.json({
      doc: {
        id: "cart-msw-1",
        ...(typeof body === "object" && body !== null ? body : {}),
      },
    });
  }),
  http.delete(({ request }) => isApiItem(request, "carts"), () => new HttpResponse(null, { status: 204 })),
  http.get(({ request }) => isApiCollection(request, "product-variants"), () =>
    HttpResponse.json({ ...emptyPage, docs: [], limit: 100 }),
  ),
  http.get(`${API_URL}/users/me`, () => HttpResponse.json({ user: null })),
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { identifier?: string };
    return HttpResponse.json({
      user: {
        id: "u1",
        email: body.identifier ?? "demo@example.com",
        role: "customer",
      },
      token: "mock-token",
      exp: Date.now() + 3600000,
    });
  }),
];
