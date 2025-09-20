import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

/** Excel/Sheets 일련번호 → JS Date */
function excelSerialToDate(n: number) {
  // 1899-12-30 기준(구글시트/엑셀 표준) → JS epoch(ms) 변환
  const epoch = Math.round((n - 25569) * 86400000);
  return new Date(epoch);
}

/** "₩50,000" 같은 문자열 → number */
function parseMoney(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v !== "string") return null;
  const n = Number(v.replace(/[^\d.-]/g, "")); // ₩, 콤마 등 제거
  return Number.isFinite(n) ? n : null;
}

/** string|number 날짜 → Date|null */
function parseAnyDate(v: unknown): Date | null {
  if (v == null) return null;
  if (typeof v === "number") {
    // 시트가 날짜를 숫자(일련번호)로 내려준 경우
    return excelSerialToDate(v);
  }
  if (typeof v === "string") {
    // 1) ISO처럼 보이면 그대로
    const d1 = new Date(v);
    if (!isNaN(d1.getTime())) return d1;
    // 2) "YYYY-MM-DD..." 앞 10글자 시도
    const ymd = v.slice(0, 10);
    const d2 = new Date(ymd);
    if (!isNaN(d2.getTime())) return d2;
  }
  return null;
}

/** 해당 월 범위(로컬 타임존 기준) */
function monthRange(ym?: string, tz?: string) {
  // ym: "2025-09" 형태, 없으면 현재 월
  const base = ym ? new Date(ym + "-01T00:00:00") : new Date();
  const z = tz ?? "Asia/Seoul";

  // 월의 첫날 00:00:00
  const start = new Date(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: z,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(base.getFullYear(), base.getMonth(), 1)) + "T00:00:00"
  );

  // 다음달 첫날 00:00:00
  const end = new Date(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: z,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(base.getFullYear(), base.getMonth() + 1, 1)) +
      "T00:00:00"
  );

  return { start, end };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // ▶ 사용법: /api/sheets/this-month-sum?sheet=9월&ym=2025-09&tz=Asia/Seoul
    const sheetName = searchParams.get("sheetName") || "9월"; // 탭 이름(필수에 가깝지만 기본값 제공)
    const ym = searchParams.get("ym") || undefined; // "YYYY-MM" (옵션)
    const tz = searchParams.get("tz") || "Asia/Seoul"; // 타임존 (옵션)

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "SHEETS_SPREADSHEET_ID missing" },
        { status: 500 }
      );
    }

    // A~G 정도 넉넉히 읽기(헤더 포함). 필요 시 열 범위 조정
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:G`,
    });

    const rows = data.values ?? [];
    if (rows.length === 0) {
      return NextResponse.json({
        month: ym ?? new Date().toISOString().slice(0, 7),
        total: 0,
      });
    }

    const [header, ...body] = rows;
    // 컬럼 위치(스샷 기준): A=카테고리, C=지출액, D=날짜
    const COL = { category: 0, amount: 2, date: 3 };

    // 이번 달 경계 계산
    const { start, end } = monthRange(ym, tz);

    const total = body.reduce((sum, r) => {
      const category = r[COL.category];
      if (category !== "expense") return sum;

      const d = parseAnyDate(r[COL.date]);
      if (!d || d < start || d >= end) return sum;

      const amt = parseMoney(r[COL.amount]);
      return amt != null ? sum + amt : sum;
    }, 0);

    return NextResponse.json({
      month: ym ?? new Date().toISOString().slice(0, 7),
      total,
      meta: { sheet: sheetName, tz },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
