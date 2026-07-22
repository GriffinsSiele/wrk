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

async function forward(request: NextRequest, pathSegments: string[]) {
  const targetUrl = buildTargetUrl(pathSegments, request.nextUrl.searchParams);
  // Lift httpOnly cookie → Bearer for the backend OAuth2 dependency.
  const token = (await cookies()).get("token")?.value;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (token) headers.set("authorization", `Bearer ${token}`);

  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const resp = await fetch(targetUrl, {
    method,
    headers,
    body: hasBody ? await request.text() : undefined,
    cache: "no-store",
  });

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
