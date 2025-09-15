import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

function getAuth() {
  const jwt = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return jwt;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { values: (string | number | null)[] };
    if (!body?.values?.length) {
      return NextResponse.json({ error: "values required" }, { status: 400 });
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

    // 현재 월을 구해서 시트 탭 이름으로 사용
    const now = new Date();
    const month = now.getMonth() + 1;
    const range = `${month}월`;

    // 마지막에 한 행 추가
    const { data } = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED", // 숫자/수식 자동 파싱
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [body.values],
      },
    });

    return NextResponse.json(
      { ok: true, update: data.updates },
      { status: 200 }
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
