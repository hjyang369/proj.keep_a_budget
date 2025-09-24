import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

// Sheets 일련번호 → JS Date
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
// 다양한 날짜 포맷 파싱 (ISO, "YYYY. M. D", 일련번호 등)
function parseAnyDate(v: unknown): Date | null {
  if (v == null) return null;
  if (typeof v === "number") return excelSerialToDate(v);
  if (typeof v === "string") {
    const d1 = new Date(v);
    if (!isNaN(d1.getTime())) return d1;
    const d2 = new Date(v.slice(0, 10));
    if (!isNaN(d2.getTime())) return d2;
    const m = v.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
    if (m) {
      const y = +m[1],
        mo = +m[2] - 1,
        d = +m[3];
      const d3 = new Date(y, mo, d);
      if (!isNaN(d3.getTime())) return d3;
    }
  }
  return null;
}

// 해당 타임존의 '오늘 00:00~내일 00:00'
function todayRange(target?: string) {
  // target: "YYYY-MM-DD" (옵션, 미지정 시 오늘)
  const base = target ? new Date(target + "T00:00:00") : new Date();
  const y = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).format(base);
  const m = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
  }).format(base);
  const d = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    day: "2-digit",
  }).format(base);
  const start = new Date(`${y}-${m}-${d}T00:00:00`);
  const end = new Date(`${y}-${m}-${d}T24:00:00`);
  return { start, end, ymd: `${y}-${m}-${d}` };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // 예) /api/sheets/get/today?sheetName=9월&type=both&tz=Asia/Seoul
    const sheetName = searchParams.get("sheetName") || "9월";
    const typeParam = (searchParams.get("type") || "both").toLowerCase() as
      | "expense"
      | "income"
      | "both";
    const expenseLabel = (searchParams.get("expenseLabel") || "지출").trim(); // 시트 A열 라벨
    const incomeLabel = (searchParams.get("incomeLabel") || "입금").trim();
    const dateOverride = searchParams.get("date"); // "YYYY-MM-DD"로 특정 날짜 조회 옵션
    const limit = Math.max(
      1,
      Math.min(200, Number(searchParams.get("limit") || 100))
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

    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:G`,
    });

    const rows = data.values ?? [];
    if (rows.length <= 1) return NextResponse.json({ date: null, items: [] });

    const [, ...body] = rows;
    const { start, end, ymd } = todayRange(dateOverride ?? undefined);

    // 행 -> 객체, 오늘 범위만, 타입 필터 적용
    let items = body
      .map((r) => {
        return {
          type: r[0] || "", // "지출" / "입금" 등
          item: r[1] || "",
          amount: parseMoney(r[2]),
          date: parseAnyDate(r[3]),
          description: r[4] || "",
          card: r[5] || "",
          note: r[6] || "",
          _raw: r,
        };
      })
      .filter(
        (x) => x.date && (x.date as Date) >= start && (x.date as Date) < end
      );

    if (typeParam === "expense") {
      items = items.filter((x) => x.type === expenseLabel);
    } else if (typeParam === "income") {
      items = items.filter((x) => x.type === incomeLabel);
    } else {
      items = items.filter(
        (x) => x.type === expenseLabel || x.type === incomeLabel
      );
    }

    // 최신순 정렬 후 제한
    items.sort(
      (a, b) => (b.date as Date).getTime() - (a.date as Date).getTime()
    );
    items = items.slice(0, limit);

    const payload = items.map((x) => ({
      type: x.type,
      item: x.item,
      amount: x.amount,
      date: (x.date as Date).toISOString(),
      description: x.description,
      card: x.card,
      note: x.note,
    }));

    return NextResponse.json({
      date: ymd,
      count: payload.length,
      items: payload,
      meta: { type: typeParam },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
