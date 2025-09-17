import { NextRequest, NextResponse } from "next/server";

const HISTORY_SERVICE_URL = process.env.HISTORY_SERVICE_URL ?? "http://141.11.156.52:3003/history";
const DEFAULT_PARAMS = {
  range: "all",
  limit: "10",
  page: "1",
};

function buildTargetUrl(requestUrl: string) {
  const source = new URL(requestUrl);
  const target = new URL(HISTORY_SERVICE_URL);

  const range = source.searchParams.get("range") ?? DEFAULT_PARAMS.range;
  const limit = source.searchParams.get("limit") ?? DEFAULT_PARAMS.limit;
  const page = source.searchParams.get("page") ?? DEFAULT_PARAMS.page;

  target.searchParams.set("range", range);
  target.searchParams.set("limit", limit);
  target.searchParams.set("page", page);

  return target;
}

export async function GET(request: NextRequest) {
  const targetUrl = buildTargetUrl(request.url);

  const headers: Record<string, string> = {
    accept: "application/json",
  };
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers.authorization = authHeader;
  }

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const rawBody = await response.text();
    let parsedBody: unknown = rawBody.length > 0 ? rawBody : null;

    if (rawBody.length > 0) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch (parseError) {
        // response is not JSON, fall back to plain text body
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message: "Failed to fetch trade history",
          statusCode: response.status,
          details: parsedBody,
        },
        { status: response.status }
      );
    }

    if (typeof parsedBody === "string") {
      return new NextResponse(parsedBody, {
        status: response.status,
        headers: {
          "content-type": response.headers.get("content-type") ?? "text/plain",
        },
      });
    }

    return NextResponse.json(parsedBody ?? {}, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json(
      {
        message: "Failed to reach trade history service",
        error: message,
      },
      { status: 502 }
    );
  }
}
