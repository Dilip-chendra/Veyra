import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  assertAuthorizedUser,
  assertOrgAccess,
} from "../src/lib/auth.ts";

test("Password hashing and verification works securely", async () => {
  const plain = "StrongSuperSecurePassword2026!";
  const hash = await hashPassword(plain);

  assert.notEqual(hash, plain);
  const isValid = await verifyPassword(plain, hash);
  assert.equal(isValid, true);

  const isInvalid = await verifyPassword("WrongPassword123", hash);
  assert.equal(isInvalid, false);
});

test("JWT Session tokens sign and verify tenant payload correctly", async () => {
  const user = {
    userId: "usr_tenant_1",
    email: "candidate@veyra.ai",
    name: "Alex Morgan",
    role: "CANDIDATE",
    orgId: "org_alpha",
  };

  const token = await createSessionToken(user);
  assert.ok(typeof token === "string");

  const verified = await verifySessionToken(token);
  assert.ok(verified);
  assert.equal(verified?.userId, "usr_tenant_1");
  assert.equal(verified?.role, "CANDIDATE");
  assert.equal(verified?.orgId, "org_alpha");
});

test("Tenant isolation assertions protect unauthorized user access", () => {
  const userSession = {
    userId: "usr_100",
    email: "test@veyra.ai",
    name: "User 100",
    role: "CANDIDATE",
  };

  // Same user passes
  assert.doesNotThrow(() => assertAuthorizedUser(userSession, "usr_100"));

  // Different user throws Forbidden
  assert.throws(() => assertAuthorizedUser(userSession, "usr_200"), /Forbidden/);

  // Admin bypasses isolation
  const adminSession = {
    userId: "adm_999",
    email: "admin@veyra.ai",
    name: "Admin",
    role: "ADMIN",
  };
  assert.doesNotThrow(() => assertAuthorizedUser(adminSession, "usr_200"));
});
