import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 클래스명을 병합하는 유틸리티 함수
 * @param inputs - 클래스명 배열
 * @returns 병합된 클래스명 문자열
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 숫자를 한국 원화 형식으로 포맷팅
 * @param amount - 포맷팅할 금액
 * @returns 포맷팅된 금액 문자열 (예: "1,000원")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 날짜를 로컬 타임존으로 포맷팅
 * @param d - 포맷팅할 날짜
 * @returns 포맷팅된 날짜 문자열 (예: "2025-09-07")
 */
export function toLocalDateKey(d: Date): string {
  const TZ = "Asia/Seoul";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d); // 'YYYY-MM-DD'
}

/**
 * 숫자를 천 단위 구분자로 포맷팅
 * @param amount - 포맷팅할 금액
 * @returns 포맷팅된 금액 문자열 (예: "1,000")
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

/**
 * 날짜를 한국 형식으로 포맷팅
 * @param date - 포맷팅할 날짜
 * @returns 포맷팅된 날짜 문자열 (예: "2025년 9월 7일")
 */
export function formatDate(date: Date): string {
  const safeDate =
    date instanceof Date && !isNaN(date.getTime()) ? date : new Date();

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(safeDate);
}

/**
 * 날짜를 간단한 형식으로 포맷팅
 * @param date - 포맷팅할 날짜
 * @returns 포맷팅된 날짜 문자열 (예: "9/7")
 */
export function formatDateShort(date: Date): string {
  const safeDate =
    date instanceof Date && !isNaN(date.getTime()) ? date : new Date();

  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
  }).format(safeDate);
}

/**
 * 년월을 YYYY-MM 형식으로 포맷팅
 * @param date - 포맷팅할 날짜
 * @returns 포맷팅된 년월 문자열 (예: "2025-09")
 */
export function formatYearMonth(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
  })
    .format(date)
    .replace(". ", "-");
}

/**
 * 현재 월의 첫째 날과 마지막 날을 반환
 * @param date - 기준 날짜
 * @returns 월의 시작일과 종료일
 */
export function getMonthRange(date: Date): { start: Date; end: Date } {
  const year = date.getFullYear();
  const month = date.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return { start, end };
}

/**
 * 두 날짜 사이의 일수를 계산
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns 일수
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * 배열을 카테고리별로 그룹화
 * @param items - 그룹화할 아이템 배열
 * @param key - 그룹화 기준 키 또는 함수
 * @returns 그룹화된 객체
 */
export function groupBy<T>(
  items: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const group = typeof key === "function" ? key(item) : String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * 배열의 합계를 계산
 * @param items - 계산할 아이템 배열
 * @param key - 합계를 계산할 키
 * @returns 합계
 */
export function sumBy<T>(items: T[], key: keyof T): number {
  return items.reduce((sum, item) => {
    const value = item[key];
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
}

/**
 * 퍼센티지를 계산
 * @param value - 값
 * @param total - 전체 값
 * @returns 퍼센티지 (소수점 둘째 자리까지)
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
}

/**
 * 랜덤 ID 생성
 * @param length - ID 길이 (기본값: 8)
 * @returns 랜덤 ID 문자열
 */
export function generateId(length: number = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 로컬 스토리지에서 데이터를 안전하게 가져오기
 * @param key - 스토리지 키
 * @param defaultValue - 기본값
 * @returns 파싱된 데이터 또는 기본값
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * 로컬 스토리지에 데이터를 안전하게 저장
 * @param key - 스토리지 키
 * @param value - 저장할 값
 */
export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}
