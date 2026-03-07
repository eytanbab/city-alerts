import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKUP_API_URL = "https://api.tzevaadom.co.il/notifications?";

export async function GET() {
  try {
    const response = await fetch(BACKUP_API_URL, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.tzevaadom.co.il/",
        "Origin": "https://www.tzevaadom.co.il",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from source" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Alerts Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
