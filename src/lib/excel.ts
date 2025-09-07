import {
  ITransactionInput,
  ITransactionView,
  IAdminConfig,
  IApiResponse,
} from "@/types/budget";
import { generateId } from "./utils";

/**
 * 엑셀 시트 API 연동을 위한 유틸리티 함수들
 * 실제 구현에서는 Google Sheets API, Airtable API 등을 사용할 수 있습니다.
 */

/**
 * 거래 내역을 엑셀 시트에 저장
 * @param transaction - 저장할 거래 내역
 * @returns 저장 결과
 */
export async function saveTransactionToSheet(
  transaction: ITransactionInput
): Promise<IApiResponse> {
  try {
    // TODO: 실제 엑셀 시트 API 연동 구현
    // 예시: Google Sheets API, Airtable API 등

    const transactionWithId: ITransactionView = {
      id: generateId(),
      ...transaction,
      owner: determineOwner(transaction.card), // 카드 정보로 소유자 판단
    };

    // 로컬 스토리지에 임시 저장 (개발용)
    const existingTransactions = getTransactionsFromStorage();
    existingTransactions.push(transactionWithId);
    localStorage.setItem(
      "budget_transactions",
      JSON.stringify(existingTransactions)
    );

    return {
      success: true,
      data: transactionWithId,
      message: "거래 내역이 성공적으로 저장되었습니다.",
    };
  } catch (error) {
    console.error("거래 내역 저장 실패:", error);
    return {
      success: false,
      message: "거래 내역 저장에 실패했습니다.",
      errorCode: "SAVE_TRANSACTION_FAILED",
    };
  }
}

/**
 * 엑셀 시트에서 거래 내역 목록 조회
 * @param month - 조회할 월 (YYYY-MM 형식, 선택사항)
 * @returns 거래 내역 목록
 */
export async function getTransactionsFromSheet(
  month?: string
): Promise<IApiResponse<ITransactionView[]>> {
  try {
    // TODO: 실제 엑셀 시트 API 연동 구현

    // 로컬 스토리지에서 임시 조회 (개발용)
    const transactions = getTransactionsFromStorage();

    let filteredTransactions = transactions;
    if (month) {
      filteredTransactions = transactions.filter((transaction) => {
        const transactionMonth = new Date(transaction.date)
          .toISOString()
          .slice(0, 7);
        return transactionMonth === month;
      });
    }

    return {
      success: true,
      data: filteredTransactions,
    };
  } catch (error) {
    console.error("거래 내역 조회 실패:", error);
    return {
      success: false,
      message: "거래 내역 조회에 실패했습니다.",
      errorCode: "GET_TRANSACTIONS_FAILED",
    };
  }
}

/**
 * 관리 설정을 엑셀 시트에 저장
 * @param config - 저장할 관리 설정
 * @returns 저장 결과
 */
export async function saveAdminConfigToSheet(
  config: IAdminConfig
): Promise<IApiResponse> {
  try {
    // TODO: 실제 엑셀 시트 API 연동 구현

    // 로컬 스토리지에 임시 저장 (개발용)
    localStorage.setItem("budget_admin_config", JSON.stringify(config));

    return {
      success: true,
      data: config,
      message: "관리 설정이 성공적으로 저장되었습니다.",
    };
  } catch (error) {
    console.error("관리 설정 저장 실패:", error);
    return {
      success: false,
      message: "관리 설정 저장에 실패했습니다.",
      errorCode: "SAVE_CONFIG_FAILED",
    };
  }
}

/**
 * 엑셀 시트에서 관리 설정 조회
 * @returns 관리 설정
 */
export async function getAdminConfigFromSheet(): Promise<
  IApiResponse<IAdminConfig>
> {
  try {
    // TODO: 실제 엑셀 시트 API 연동 구현

    // 로컬 스토리지에서 임시 조회 (개발용)
    const config = getAdminConfigFromStorage();

    return {
      success: true,
      data: config,
    };
  } catch (error) {
    console.error("관리 설정 조회 실패:", error);
    return {
      success: false,
      message: "관리 설정 조회에 실패했습니다.",
      errorCode: "GET_CONFIG_FAILED",
    };
  }
}

/**
 * 카드 정보로 소유자 판단
 * @param card - 결제수단
 * @returns 소유자
 */
function determineOwner(card: string): "성욱" | "회진" {
  if (card.includes("성욱")) {
    return "성욱";
  }
  if (card.includes("회진")) {
    return "회진";
  }
  // 기본값은 회진으로 설정 (실제로는 더 정확한 로직 필요)
  return "회진";
}

/**
 * 로컬 스토리지에서 거래 내역 조회 (개발용)
 * @returns 거래 내역 목록
 */
function getTransactionsFromStorage(): ITransactionView[] {
  try {
    const stored = localStorage.getItem("budget_transactions");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("로컬 스토리지에서 거래 내역 조회 실패:", error);
    return [];
  }
}

/**
 * 로컬 스토리지에서 관리 설정 조회 (개발용)
 * @returns 관리 설정
 */
function getAdminConfigFromStorage(): IAdminConfig {
  try {
    const stored = localStorage.getItem("budget_admin_config");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("로컬 스토리지에서 관리 설정 조회 실패:", error);
  }

  // 기본 설정 반환
  return {
    cards: ["성욱현금", "회진현금", "회진카카오체크"],
    categories: ["식비", "운동", "용돈", "교통비", "쇼핑", "의료비", "기타"],
    monthlyBudget: 0,
    categoryBudgets: {},
  };
}

/**
 * 엑셀 시트 데이터 초기화 (개발용)
 */
export function initializeSheetData(): void {
  // 기본 거래 내역 데이터 (개발용)
  const sampleTransactions: ITransactionView[] = [
    {
      id: generateId(),
      type: "expense",
      description: "점심 식사",
      date: new Date("2025-09-07"),
      amount: 15000,
      card: "회진카카오체크",
      category: "식비",
      owner: "회진",
    },
    {
      id: generateId(),
      type: "expense",
      description: "헬스장 회비",
      date: new Date("2025-09-06"),
      amount: 50000,
      card: "성욱현금",
      category: "운동",
      owner: "성욱",
    },
    {
      id: generateId(),
      type: "income",
      description: "월급",
      date: new Date("2025-09-01"),
      amount: 3000000,
      card: "회진현금",
      category: "기타",
      owner: "회진",
    },
  ];

  localStorage.setItem(
    "budget_transactions",
    JSON.stringify(sampleTransactions)
  );

  // 기본 관리 설정
  const defaultConfig: IAdminConfig = {
    cards: [
      "성욱현금",
      "회진현금",
      "회진카카오체크",
      "성욱신한카드",
      "회진국민카드",
    ],
    categories: [
      "식비",
      "운동",
      "용돈",
      "교통비",
      "쇼핑",
      "의료비",
      "경조사",
      "기타",
    ],
    monthlyBudget: 2000000,
    categoryBudgets: {
      식비: 500000,
      운동: 100000,
      용돈: 200000,
      교통비: 100000,
      쇼핑: 300000,
      의료비: 100000,
      경조사: 200000,
      기타: 500000,
    },
  };

  localStorage.setItem("budget_admin_config", JSON.stringify(defaultConfig));
}
