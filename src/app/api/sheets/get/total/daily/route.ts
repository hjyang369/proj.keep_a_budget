// app/api/sheets/daily/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { IDailySummary, ITransactionView } from "@/types/budget";

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

function parseMoney(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v !== "string") return null;
  const n = Number(v.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sheetName = searchParams.get("sheetName") || "9월";
    const expenseLabel = "지출";
    const incomeLabel = "입금";

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
      range: `${sheetName}!A:G`, // A=거래 유형, B=카테고리, C=내용, D=금액, E=날짜, F=결제수단
    });

    const rows = data.values ?? [];
    if (rows.length <= 1) return NextResponse.json({ daily: {} });

    const [, ...body] = rows;
    const COL = {
      type: 0,
      category: 1,
      description: 4,
      amount: 2,
      date: 3,
      card: 5,
    };

    const daily: Record<string, IDailySummary> = {};

    for (const r of body) {
      const type = r[COL.type];
      const cat = (r[COL.category] || "").toString().trim();
      const description = (r[COL.description] || "").toString().trim();
      const amt = parseMoney(r[COL.amount]);
      const date = r[COL.date];
      const card = (r[COL.card] || "").toString().trim();

      if (!amt || !date) continue;

      if (!daily[date]) {
        daily[date] = {
          date: date,
          totalExpense: 0,
          totalIncome: 0,
          detail: [],
        };
      }

      // 총합계 업데이트
      if (type === expenseLabel) daily[date].totalExpense += amt;
      if (type === incomeLabel) daily[date].totalIncome += amt;

      // 상세 내역 추가
      const transactionDetail: ITransactionView = {
        id: date,
        date,
        owner: "성욱", // TODO: 소유자 판단
        description,
        amount: amt,
        card,
        category: cat,
        type,
      };

      daily[date].detail!.push(transactionDetail);
    }

    // 거래 건수 계산
    Object.values(daily).forEach((day) => {
      day.transactionCount = day.detail?.length || 0;
      day.netIncome = day.totalIncome - day.totalExpense;
    });

    return NextResponse.json({ daily });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
