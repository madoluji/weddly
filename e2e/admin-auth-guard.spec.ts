import { expect, test } from "@playwright/test";
import { SignJWT } from "jose";

const createAccessToken = async (role: string) => {
  const secret = process.env.ACCCESS_TOKEN_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing ACCCESS_TOKEN_SECRET_KEY for role-based auth tests");
  }

  return new SignJWT({
    id: "e2e-user-id",
    email: `e2e-${role}@example.com`,
    role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode(secret));
};

test("redirects unauthenticated users from admin page to admin login", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin\/login\?callbackUrl=/);
});

test("blocks unauthenticated access to admin API", async ({ request }) => {
  const response = await request.get("/api/admin/stats");

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toMatchObject({
    error: expect.any(String),
  });
});

test.describe("admin API role boundaries", () => {
  test.skip(
    !process.env.ACCCESS_TOKEN_SECRET_KEY,
    "Requires ACCCESS_TOKEN_SECRET_KEY to sign test tokens"
  );

  test("blocks regular user token on admin API", async ({ request }) => {
    const token = await createAccessToken("user");
    const response = await request.post("/api/admin/fetchalltransactions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {},
    });

    expect(response.status()).toBe(403);
  });

  test("allows useradmin token on non-super-admin API", async ({ request }) => {
    const token = await createAccessToken("useradmin");
    const response = await request.post("/api/admin/fetchalltransactions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {},
    });

    // 405 indicates auth passed and handler rejected method as designed.
    expect(response.status()).toBe(405);
  });

  test("blocks useradmin token on super-admin API", async ({ request }) => {
    const token = await createAccessToken("useradmin");
    const response = await request.patch("/api/admin/super-admin/promote-admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {},
    });

    expect(response.status()).toBe(403);
  });

  test("allows superadmin token to reach super-admin handler", async ({ request }) => {
    const token = await createAccessToken("superadmin");
    const response = await request.patch("/api/admin/super-admin/promote-admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {},
    });

    // 400 means superadmin auth passed and handler validated request body.
    expect(response.status()).toBe(400);
  });
});
