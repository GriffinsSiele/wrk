import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Prefer INTERNAL_API_URL so the Next container can reach FastAPI on the Docker network.
const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function buildTargetUrl(pathSegments: string[], searchParams: URLSearchParams): string {
  const path = pathSegments.join("/");
  const qs = searchParams.toString();
  return `${API_BASE}/api/${path}${qs ? `?${qs}` : ""}`;
}

/**
 * FastAPI list routes are often registered as `/resource/` and redirect `/resource` → `/resource/`.
 * Automatic redirect following strips Authorization, which becomes a 401.
 * Resolve that by appending a trailing slash for bare collection roots, and by
 * manually replaying slash redirects with the same auth headers.
 */
function withCollectionSlash(url: string): string {
  try {
    const u = new URL(url);
    if (!u.pathname.endsWith("/")) {
      const segments = u.pathname.split("/").filter(Boolean);
      // /api/coaches, /api/projects, /api/courses, /api/leads (single resource under /api)
      if (segments.length === 2 && segments[0] === "api") {
        u.pathname = `${u.pathname}/`;
      }
    }
    return u.toString();
  } catch {
    return url;
  }
}

async function fetchUpstream(
  url: string,
  init: RequestInit,
  headers: Headers,
): Promise<Response> {
  let resp = await fetch(url, { ...init, headers, redirect: "manual", cache: "no-store" });
  if ([301, 302, 307, 308].includes(resp.status)) {
    const location = resp.headers.get("location");
    if (location) {
      const nextUrl = location.startsWith("http")
        ? location
        : new URL(location, url).toString();
      resp = await fetch(nextUrl, { ...init, headers, redirect: "manual", cache: "no-store" });
    }
  }
  return resp;
}

async function forward(request: NextRequest, pathSegments: string[]) {
  const targetUrl = withCollectionSlash(
    buildTargetUrl(pathSegments, request.nextUrl.searchParams),
  );
  // Lift httpOnly cookie → Bearer for the backend OAuth2 dependency.
  const token = (await cookies()).get("token")?.value;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (token) headers.set("authorization", `Bearer ${token}`);

  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? await request.text() : undefined;

  const resp = await fetchUpstream(targetUrl, { method, body }, headers);

  const text = await resp.text();
  let payload: unknown = text;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON bodies are still wrapped so the client always gets application/json.
  }

  return NextResponse.json(payload, { status: resp.status });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path);
}
