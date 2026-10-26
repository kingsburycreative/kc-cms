import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isStaticPath, resolveShort } from "./kc/short-url.ts";

function isAllowedOrigin(originHeader: string, hostHeader: string): boolean {
	try {
		const originUrl = new URL(originHeader);
		return originUrl.host.toLowerCase() === hostHeader.toLowerCase();
	} catch {
		return false;
	}
}

export function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	if (isStaticPath(pathname, request.method)) {
		return NextResponse.next();
	}

	if (pathname.startsWith("/api/") && pathname !== "/api/webhook/github" && request.method !== "GET") {
		const originHeader = request.headers.get("Origin");
		const hostHeader = request.headers.get("Host");
		if (!originHeader || !hostHeader || !isAllowedOrigin(originHeader, hostHeader)) {
			return new NextResponse(null, {
				status: 403
			});
		}
	}

	const requestHeaders = new Headers(request.headers);
	const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
	requestHeaders.set("x-return-to", returnTo);

	const short = resolveShort(pathname, request.method);
	if (short) {
		const url = request.nextUrl.clone();
		if ("redirect" in short) {
			url.pathname = short.redirect;
			return NextResponse.redirect(url, 308);
		}
		url.pathname = short.rewrite;
		return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
	}

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
}

export const config = {
	matcher: "/:path*"
}
