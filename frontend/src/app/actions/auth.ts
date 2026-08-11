"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function decodeJwtPayload(token: string): Record<string, unknown> {
  // Client-side decode for role routing only — signature is verified by the API.
  const payloadPart = token.split(".")[1];
  if (!payloadPart) {
    throw new Error("Invalid token payload");
  }

  const payloadJson = Buffer.from(payloadPart, "base64url").toString("utf8");
  return JSON.parse(payloadJson);
}

export async function login(_prevState: unknown, formData: FormData) {
  if (!formData) return null;

  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    // Server-side Docker network prefers INTERNAL_API_URL over the public API URL.
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000";
    // OAuth2PasswordRequestForm field is `username`; we send the email.
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: email.toString(),
        password: password.toString(),
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.detail || "Failed to login" };
    }

    const data = await res.json();

    // Store access token only (refresh is not wired client-side yet). maxAge must match backend access TTL.
    const cookieStore = await cookies();
    cookieStore.set("token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    const payload = decodeJwtPayload(data.access_token);

    if (payload.role === "admin") {
      redirect("/admin");
    } else if (payload.role === "coach") {
      redirect("/coach");
    } else {
      redirect("/learner");
    }
  } catch (error) {
    // Next.js implements redirect() via throw; must rethrow or login appears to fail.
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    return { error: "An unexpected error occurred" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}
