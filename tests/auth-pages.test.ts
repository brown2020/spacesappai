import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("dedicated auth pages", () => {
  it("exposes /login, /signup, and /forgot-password routes", () => {
    for (const route of ["login", "signup", "forgot-password"]) {
      assert.equal(
        existsSync(join(root, `src/app/${route}/page.tsx`)),
        true,
        `missing src/app/${route}/page.tsx`
      );
    }
  });

  it("header CTAs link to dedicated auth pages", () => {
    const src = readFileSync(join(root, "src/components/Header.tsx"), "utf8");
    assert.match(src, /href=["']\/login["']/);
    assert.match(src, /href=["']\/signup["']/);
    assert.doesNotMatch(src, /signInWithGoogle/);
  });

  it("home CTA links to /login and /signup instead of hero mode tabs", () => {
    const src = readFileSync(
      join(root, "src/components/HomeAuthCta.tsx"),
      "utf8"
    );
    assert.match(src, /href=["']\/login["']/);
    assert.match(src, /href=["']\/signup["']/);
    assert.doesNotMatch(src, /AuthMode|forgot-sent|Use email instead/);
  });

  it("AuthProvider leaves auth pages after session sync", () => {
    const src = readFileSync(
      join(root, "src/providers/AuthProvider.tsx"),
      "utf8"
    );
    assert.match(src, /syncSessionCookie/);
    assert.match(src, /\/login/);
    assert.match(src, /window\.location\.assign\("\/"\)/);
    assert.match(src, /mapFirebaseAuthError|dispatchMappedError/);
  });

  
  it("login and signup password fields have accessible show/hide (eye)", () => {
    for (const file of ["LoginForm.tsx", "SignupForm.tsx"]) {
      const src = readFileSync(
        join(root, `src/components/auth/${file}`),
        "utf8"
      );
      assert.match(src, /PasswordField/);
    }
    const field = readFileSync(
      join(root, "src/components/auth/PasswordField.tsx"),
      "utf8"
    );
    assert.match(field, /Show password/);
    assert.match(field, /Hide password/);
    assert.match(field, /EyeOff|Eye/);
    assert.match(field, /aria-pressed/);
  });

  it("forgot-password form uses sendPasswordReset and returns to login", () => {
    const src = readFileSync(
      join(root, "src/components/auth/ForgotPasswordForm.tsx"),
      "utf8"
    );
    assert.match(src, /sendPasswordReset/);
    assert.match(src, /href=["']\/login["']/);
    assert.match(src, /Back to sign in/);
  });
});
