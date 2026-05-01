import { NextRequest, NextResponse } from "next/server";
import { getBackendApiBaseUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

const hopByHopHeaders = new Set([
  "connection",
  "content-length",
  "host",
  "origin",
  "referer",
  "transfer-encoding",
]);

const buildTargetUrl = (path: string[], search: string) => {
  const baseUrl = getBackendApiBaseUrl();
  const normalizedPath = path.join("/");
  return `${baseUrl}/api/${normalizedPath}${search}`;
};

const getForwardHeaders = (request: NextRequest) => {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  return headers;
};

const proxyRequest = async (request: NextRequest, path: string[]) => {
  const targetUrl = buildTargetUrl(path, request.nextUrl.search);
  const headers = getForwardHeaders(request);
  const requestBody =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: requestBody,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  upstreamResponse.headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (normalizedKey === "set-cookie" || normalizedKey === "content-length" || normalizedKey === "transfer-encoding") {
      return;
    }

    responseHeaders.set(key, value);
  });

  const setCookie = upstreamResponse.headers.getSetCookie?.() ?? [];
  if (setCookie.length > 0) {
    for (const cookie of setCookie) {
      responseHeaders.append("set-cookie", cookie);
    }
  } else {
    const cookieHeader = upstreamResponse.headers.get("set-cookie");
    if (cookieHeader) {
      responseHeaders.append("set-cookie", cookieHeader);
    }
  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
};

export const GET = (request: NextRequest, context: { params: { path: string[] } }) =>
  proxyRequest(request, context.params.path);

export const POST = (request: NextRequest, context: { params: { path: string[] } }) =>
  proxyRequest(request, context.params.path);

export const PUT = (request: NextRequest, context: { params: { path: string[] } }) =>
  proxyRequest(request, context.params.path);

export const PATCH = (request: NextRequest, context: { params: { path: string[] } }) =>
  proxyRequest(request, context.params.path);

export const DELETE = (request: NextRequest, context: { params: { path: string[] } }) =>
  proxyRequest(request, context.params.path);

export const OPTIONS = (request: NextRequest, context: { params: { path: string[] } }) =>
  proxyRequest(request, context.params.path);
