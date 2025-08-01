// src/app/api/ping/route.ts
export async function GET(request: Request) {
  return new Response("pingpong", { status: 200 });
}
