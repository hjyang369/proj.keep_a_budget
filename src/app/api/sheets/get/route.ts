import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

// 공백/특수문자/한글 탭명 안전처리용
function quoteSheetTitle(title: string) {
  const escaped = title.replace(/'/g, "''");
  return `'${escaped}'`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 시트이름, 범위 설정
    const rawSheetName = searchParams.get("sheetName");
    const rawRange = searchParams.get("range");
    if (!rawSheetName) {
      return NextResponse.json(
        { error: "sheetName is required" },
        { status: 400 }
      );
    }

    // range를 생략하면 탭 전체를 읽도록 기본값 설정
    const rangeParam =
      rawRange && rawRange.trim().length > 0 ? rawRange.trim() : "";

    // 2) 시트 이름 안전 처리 (공백/특수문자 호환)
    const sheetRef = quoteSheetTitle(rawSheetName);

    // 3) 최종 range 문자열 만들기
    //   - rangeParam이 비었으면 탭 전체
    //   - 있으면 `${시트명}!${범위}`
    const range = rangeParam ? `${sheetRef}!${rangeParam}` : `${sheetRef}`;

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
      range,
    });

    return NextResponse.json({
      sheet: rawSheetName,
      range: rangeParam || "(entire sheet)",
      values: data?.values?.flat().filter(Boolean) || [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}

// 예시
// 1) 탭 전체 읽기 (범위 생략)
// await fetch(encodeURI(`/api/sheets/get?sheetName=9월`))

// 2) 특정 영역
// await fetch(encodeURI(`/api/sheets/get?sheetName=9월&range=A1:E10`))

// 3) 특정 열 전체
// await fetch(encodeURI(`/api/sheets/get?sheetName=9월&range=B:B`))

// 4) 마지막 행까지 가변(행 수 모를 때, 열만 지정)
// await fetch(encodeURI(`/api/sheets/get?sheetName=9월&range=A:E`))
