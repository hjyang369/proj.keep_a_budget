/**
 * 거래 유형 (입금/지출)
 */
export type TransactionType = "입금" | "지출";

/**
 * 사용자 타입 (성욱/회진)
 */
export type UserType = "성욱" | "회진";

/**
 * 입력 페이지 - 거래 내역 입력 인터페이스
 */
export interface ITransactionInput {
  /** 거래 유형 (입금/지출) */
  type: TransactionType;
  /** 거래 내용 */
  description: string;
  /** 거래 날짜 */
  date: string | Date;
  /** 거래 금액 */
  amount: number;
  /** 결제수단 (성욱현금, 회진현금, 회진카카오체크 등) */
  card: string;
  /** 카테고리 (식비, 운동, 용돈 등) */
  category: string;
}

/**
 * 보기 페이지 - 조회용 거래 내역 인터페이스
 */
export interface ITransactionView {
  /** 고유 ID */
  id: string;
  /** 거래 유형 */
  type: TransactionType;
  /** 거래 내용 */
  description: string;
  /** 거래 날짜 */
  date: Date;
  /** 거래 금액 */
  amount: number;
  /** 결제수단 */
  card: string;
  /** 카테고리 */
  category: string;
  /** 거래 주체 (누가 썼는지) */
  owner: UserType;
}

/**
 * 분석 페이지 - 분석 결과 인터페이스
 */
export interface IAnalysisResult {
  /** 평소보다 많이 쓴 카테고리 목록 */
  overspentCategories: string[];
  /** 다음달 절약 추천 메시지 목록 */
  savingTips: string[];
  /** 계획 예산 대비 초과 금액 */
  budgetExceeded: number;
  /** 월별 평균 지출 대비 현재 월 지출 비율 */
  monthlySpendingRatio: number;
}

/**
 * 어드민 페이지 - 관리 설정 인터페이스
 */
export interface IAdminConfig {
  /** 등록된 결제수단 목록 */
  cards: string[];
  /** 등록된 카테고리 목록 */
  categories: string[];
  /** 이번달 계획 금액 */
  monthlyBudget: number;
  /** 카테고리별 계획 금액 */
  categoryBudgets: Record<string, number>;
}

/**
 * 월별 지출 요약 인터페이스
 */
export interface IMonthlySummary {
  /** 년월 (YYYY-MM 형식) */
  month: string;
  /** 총 입금액 */
  totalIncome: number;
  /** 총 지출액 */
  totalExpense: number;
  /** 순수익 (입금 - 지출) */
  netIncome: number;
}

/**
 * 카테고리별 지출 요약 인터페이스
 */
export interface ICategorySummary {
  /** 카테고리명 */
  category: string;
  /** 지출 금액 */
  amount: number;
  /** 지출 비율 (%) */
  percentage: number;
  /** 거래 건수 */
  count: number;
}

/**
 * 사용자별 지출 요약 인터페이스
 */
export interface IUserExpenseSummary {
  /** 사용자 */
  user: UserType;
  /** 총 지출액 */
  totalAmount: number;
  /** 거래 건수 */
  transactionCount: number;
  /** 카테고리별 지출 */
  categoryBreakdown: ICategorySummary[];
}

/**
 * 차트 데이터 인터페이스
 */
export interface IChartData {
  /** 라벨 */
  label: string;
  /** 값 */
  value: number;
  /** 색상 (선택사항) */
  color?: string;
}

/**
 * 폼 검증 에러 인터페이스
 */
export interface IFormErrors {
  [key: string]: string | undefined;
}

/**
 * API 응답 기본 인터페이스
 */
export interface IApiResponse<T = any> {
  /** 성공 여부 */
  success: boolean;
  /** 응답 데이터 */
  data?: T;
  /** 에러 메시지 */
  message?: string;
  /** 에러 코드 */
  errorCode?: string;
}
