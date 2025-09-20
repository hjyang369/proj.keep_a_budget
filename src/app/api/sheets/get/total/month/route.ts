import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// TODO ym 지우기

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

/** Sheets 일련번호 → JS Date */
function excelSerialToDate(n: number) {
  return new Date(Math.round((n - 25569) * 86400000));
}

/** 금액 변형"₩50,000" → 50000 */
function parseMoney(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v !== "string") return null;
  const n = Number(v.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** string|number 날짜 변형 → Date|null */
function parseAnyDate(v: unknown): Date | null {
  if (v == null) return null;
  if (typeof v === "number") return excelSerialToDate(v);
  if (typeof v === "string") {
    const d1 = new Date(v);
    if (!isNaN(d1.getTime())) return d1;
    const d2 = new Date(v.slice(0, 10));
    if (!isNaN(d2.getTime())) return d2;
  }
  return null;
}

/** 해당 월 범위(기본 Asia/Seoul) */
function monthRange(ym?: string, tz = "Asia/Seoul") {
  const base = ym ? new Date(ym + "-01T00:00:00") : new Date();
  const startLocal = new Date(base.getFullYear(), base.getMonth(), 1);
  const endLocal = new Date(base.getFullYear(), base.getMonth() + 1, 1);
  // 로컬을 그대로 비교해도 충분 (시트 값이 날짜만 있을 경우)
  return { start: startLocal, end: endLocal };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sheetName = searchParams.get("sheetName") || "9월";
    const ym = searchParams.get("ym") || undefined; // "YYYY-MM"

    const expenseLbl = searchParams.get("expenseLabel") || "지출";
    const incomeLbl = searchParams.get("incomeLabel") || "입금";

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
    if (rows.length === 0) {
      return NextResponse.json({
        month: ym ?? new Date().toISOString().slice(0, 7),
        expenseTotal: 0,
        incomeTotal: 0,
      });
    }

    const [header, ...body] = rows;
    const COL = { category: 0, amount: 2, date: 3 };

    const { start, end } = monthRange(ym);

    let totalExpense = 0;
    let totalIncome = 0;

    for (const r of body) {
      const cat = r[COL.category];
      const d = parseAnyDate(r[COL.date]);
      if (!d || d < start || d >= end) continue;

      const amt = parseMoney(r[COL.amount]);
      if (amt == null) continue;

      if (cat === expenseLbl) totalExpense += amt;
      if (cat === incomeLbl) totalIncome += amt;
    }

    const payload = {
      month: ym ?? new Date().toISOString().slice(0, 7),
      totalExpense,
      totalIncome,
      netIncome: totalIncome - totalExpense,
    };

    return NextResponse.json(payload);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}

// 이번달 수입/지출 둘 다
// "/api/sheets/get/total/month?sheetName=9월"

// 특정 월
// "/api/sheets/get/total/month?sheetName=9월&ym=2025-08"
