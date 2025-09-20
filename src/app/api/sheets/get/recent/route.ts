import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

// Sheets/Excel 일련번호 → JS Date
function excelSerialToDate(n: number) {
  return new Date(Math.round((n - 25569) * 86400000));
}

// "₩50,000" → 50000
function parseMoney(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v !== "string") return null;
  const n = Number(v.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

// 다양한 날짜 포맷 파싱 (ISO, "YYYY. M. D", 요일문자, 일련번호 등)
function parseAnyDate(v: unknown): Date | null {
  if (v == null) return null;
  if (typeof v === "number") return excelSerialToDate(v);
  if (typeof v === "string") {
    // 1) 직접 Date 시도
    const d1 = new Date(v);
    if (!isNaN(d1.getTime())) return d1;
    // 2) 앞 10글자(YYYY-MM-DD) 시도
    const d2 = new Date(v.slice(0, 10));
    if (!isNaN(d2.getTime())) return d2;
    // 3) "YYYY. M. D" 패턴 시도
    const m = v.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
    if (m) {
      const y = Number(m[1]),
        mo = Number(m[2]) - 1,
        d = Number(m[3]);
      const d3 = new Date(y, mo, d);
      if (!isNaN(d3.getTime())) return d3;
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // 사용법: /api/sheets/recent?sheet=9월&limit=5
    const sheetName = searchParams.get("sheetName") || "9월";
    const limit = Math.max(
      1,
      Math.min(100, Number(searchParams.get("limit") || 5))
    );

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "SHEETS_SPREADSHEET_ID missing" },
        { status: 500 }
      );
    }

    // 헤더 포함 A~G 넉넉히 읽기
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:G`,
    });

    const rows = data.values ?? [];
    if (rows.length <= 1) return NextResponse.json({ items: [] });

    const [, ...body] = rows;

    // 행 → 객체로 변환 + 유효한 날짜만
    const items = body
      .map((r) => {
        const date = parseAnyDate(r[3]);
        return {
          type: r[0] || "", // "지출" / "입금" 등
          item: r[1] || "",
          amount: parseMoney(r[2]),
          date,
          description: r[4] || "",
          card: r[5] || "",
          note: r[6] || "",
          _raw: r,
        };
      })
      .filter((x) => x.date instanceof Date && !isNaN(x.date.getTime()));

    // 날짜 내림차순 정렬 → 상위 N개
    items.sort(
      (a, b) => (b.date as Date).getTime() - (a.date as Date).getTime()
    );

    const topN = items.slice(0, limit).map((x) => ({
      type: x.type,
      item: x.item,
      amount: x.amount, // 숫자 (통화 포맷은 프런트에서)
      date: (x.date as Date).toISOString(), // ISO 문자열
      description: x.description,
      card: x.card,
      note: x.note,
    }));

    return NextResponse.json({ items: topN });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}

// 최근 5건
// "/api/sheets/get/recent?sheetName=9월"

// 최근 10건
// "/api/sheets/get/recent?sheetName=9월&limit=10"
