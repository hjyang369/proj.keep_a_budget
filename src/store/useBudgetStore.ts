import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ITransactionInput,
  ITransactionView,
  IAdminConfig,
  IAnalysisResult,
  IMonthlySummary,
  ICategorySummary,
  IUserExpenseSummary,
  UserType,
} from "@/types/budget";
import {
  saveTransactionToSheet,
  getTransactionsFromSheet,
  saveAdminConfigToSheet,
  getAdminConfigFromSheet,
  initializeSheetData,
} from "@/lib/excel";
import {
  groupBy,
  sumBy,
  calculatePercentage,
  formatYearMonth,
} from "@/lib/utils";

/**
 * 가계부 스토어 상태 인터페이스
 */
interface IBudgetState {
  // 거래 내역 관련
  transactions: ITransactionView[];
  isLoadingTransactions: boolean;

  // 관리 설정 관련
  adminConfig: IAdminConfig;
  isLoadingConfig: boolean;

  // 분석 결과 관련
  analysisResult: IAnalysisResult | null;
  isLoadingAnalysis: boolean;

  // UI 상태 관련
  selectedUser: UserType;
  selectedMonth: string;

  // 액션들
  addTransaction: (transaction: ITransactionInput) => Promise<void>;
  loadTransactions: (month?: string) => Promise<void>;
  loadAdminConfig: () => Promise<void>;
  updateAdminConfig: (config: Partial<IAdminConfig>) => Promise<void>;
  generateAnalysis: () => Promise<void>;
  setSelectedUser: (user: UserType) => void;
  setSelectedMonth: (month: string) => void;
  initializeData: () => void;
  // Hydration 처리
  hydrate: () => void;

  // 계산된 값들
  getMonthlySummary: () => IMonthlySummary | null;
  getCategorySummary: () => ICategorySummary[];
  getUserExpenseSummary: () => IUserExpenseSummary[];
  getCurrentMonthTransactions: () => ITransactionView[];
  getTransactionsByUser: (user: UserType) => ITransactionView[];
}

/**
 * 가계부 스토어 생성
 */
export const useBudgetStore = create<IBudgetState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      transactions: [],
      isLoadingTransactions: false,
      adminConfig: {
        cards: [],
        categories: [],
        monthlyBudget: 0,
        categoryBudgets: {},
      },
      isLoadingConfig: false,
      analysisResult: null,
      isLoadingAnalysis: false,
      selectedUser: "회진",
      selectedMonth: "",

      // 거래 내역 추가
      addTransaction: async (transaction: ITransactionInput) => {
        try {
          const result = await saveTransactionToSheet(transaction);
          if (result.success && result.data) {
            set((state) => ({
              transactions: [
                ...state.transactions,
                result.data as ITransactionView,
              ],
            }));
          } else {
            throw new Error(result.message || "거래 내역 저장에 실패했습니다.");
          }
        } catch (error) {
          console.error("거래 내역 추가 실패:", error);
          throw error;
        }
      },

      // 거래 내역 로드
      loadTransactions: async (month?: string) => {
        set({ isLoadingTransactions: true });
        try {
          const result = await getTransactionsFromSheet(month);
          if (result.success && result.data) {
            set({ transactions: result.data });
          } else {
            throw new Error(result.message || "거래 내역 조회에 실패했습니다.");
          }
        } catch (error) {
          console.error("거래 내역 로드 실패:", error);
        } finally {
          set({ isLoadingTransactions: false });
        }
      },

      // 관리 설정 로드
      loadAdminConfig: async () => {
        set({ isLoadingConfig: true });
        try {
          const result = await getAdminConfigFromSheet();
          if (result.success && result.data) {
            set({ adminConfig: result.data });
          } else {
            throw new Error(result.message || "관리 설정 조회에 실패했습니다.");
          }
        } catch (error) {
          console.error("관리 설정 로드 실패:", error);
        } finally {
          set({ isLoadingConfig: false });
        }
      },

      // 관리 설정 업데이트
      updateAdminConfig: async (config: Partial<IAdminConfig>) => {
        try {
          const currentConfig = get().adminConfig;
          const updatedConfig = { ...currentConfig, ...config };

          const result = await saveAdminConfigToSheet(updatedConfig);
          if (result.success) {
            set({ adminConfig: updatedConfig });
          } else {
            throw new Error(result.message || "관리 설정 저장에 실패했습니다.");
          }
        } catch (error) {
          console.error("관리 설정 업데이트 실패:", error);
          throw error;
        }
      },

      // 분석 결과 생성
      generateAnalysis: async () => {
        set({ isLoadingAnalysis: true });
        try {
          const { transactions, adminConfig } = get();
          const currentMonth = get().selectedMonth;

          // 현재 월 거래 내역 필터링
          const currentMonthTransactions = transactions.filter(
            (transaction) => {
              const transactionMonth = formatYearMonth(
                new Date(transaction.date)
              );
              return transactionMonth === currentMonth;
            }
          );

          // 지출 내역만 필터링
          const expenses = currentMonthTransactions.filter(
            (t) => t.type === "expense"
          );

          // 카테고리별 지출 분석
          const categoryGroups = groupBy(expenses, "category");
          const categorySpending: Record<string, number> = {};

          Object.entries(categoryGroups).forEach(([category, transactions]) => {
            categorySpending[category] = sumBy(transactions, "amount");
          });

          // 평소보다 많이 쓴 카테고리 찾기
          const overspentCategories: string[] = [];
          Object.entries(categorySpending).forEach(([category, amount]) => {
            const budget = adminConfig.categoryBudgets[category] || 0;
            if (budget > 0 && amount > budget * 1.2) {
              // 20% 초과시
              overspentCategories.push(category);
            }
          });

          // 절약 팁 생성
          const savingTips: string[] = [];
          if (overspentCategories.length > 0) {
            savingTips.push(
              `${overspentCategories.join(
                ", "
              )} 카테고리에서 예산을 초과했습니다.`
            );
            savingTips.push("다음 달에는 해당 카테고리의 지출을 줄여보세요.");
          }

          const totalSpent = sumBy(expenses, "amount");
          if (totalSpent > adminConfig.monthlyBudget) {
            savingTips.push(
              `이번 달 총 지출이 예산을 ${(
                totalSpent - adminConfig.monthlyBudget
              ).toLocaleString()}원 초과했습니다.`
            );
          }

          // 월별 평균 대비 비율 계산 (간단한 예시)
          const monthlySpendingRatio =
            adminConfig.monthlyBudget > 0
              ? calculatePercentage(totalSpent, adminConfig.monthlyBudget)
              : 0;

          const analysisResult: IAnalysisResult = {
            overspentCategories,
            savingTips,
            budgetExceeded: Math.max(0, totalSpent - adminConfig.monthlyBudget),
            monthlySpendingRatio,
          };

          set({ analysisResult });
        } catch (error) {
          console.error("분석 결과 생성 실패:", error);
        } finally {
          set({ isLoadingAnalysis: false });
        }
      },

      // 선택된 사용자 설정
      setSelectedUser: (user: UserType) => {
        set({ selectedUser: user });
      },

      // 선택된 월 설정
      setSelectedMonth: (month: string) => {
        set({ selectedMonth: month });
      },

      // 데이터 초기화
      initializeData: () => {
        initializeSheetData();
        get().loadTransactions();
        get().loadAdminConfig();
      },

      // Hydration 처리
      hydrate: () => {
        // 클라이언트에서만 실행
        if (typeof window !== "undefined") {
          // selectedMonth가 비어있으면 현재 월로 설정
          const currentState = get();
          if (!currentState.selectedMonth) {
            set({
              selectedMonth: formatYearMonth(new Date()),
            });
          }
        }
      },

      // 월별 요약 계산
      getMonthlySummary: () => {
        const { transactions, selectedMonth } = get();
        const currentMonthTransactions = transactions.filter((transaction) => {
          const transactionMonth = formatYearMonth(new Date(transaction.date));
          return transactionMonth === selectedMonth;
        });

        if (currentMonthTransactions.length === 0) return null;

        const totalIncome = sumBy(
          currentMonthTransactions.filter((t) => t.type === "income"),
          "amount"
        );
        const totalExpense = sumBy(
          currentMonthTransactions.filter((t) => t.type === "expense"),
          "amount"
        );

        return {
          month: selectedMonth,
          totalIncome,
          totalExpense,
          netIncome: totalIncome - totalExpense,
        };
      },

      // 카테고리별 요약 계산
      getCategorySummary: () => {
        const { transactions, selectedMonth } = get();
        const currentMonthExpenses = transactions.filter((transaction) => {
          const transactionMonth = formatYearMonth(new Date(transaction.date));
          return (
            transactionMonth === selectedMonth && transaction.type === "expense"
          );
        });

        const categoryGroups = groupBy(currentMonthExpenses, "category");
        const totalExpense = sumBy(currentMonthExpenses, "amount");

        return Object.entries(categoryGroups)
          .map(([category, transactions]) => ({
            category,
            amount: sumBy(transactions, "amount"),
            percentage: calculatePercentage(
              sumBy(transactions, "amount"),
              totalExpense
            ),
            count: transactions.length,
          }))
          .sort((a, b) => b.amount - a.amount);
      },

      // 사용자별 지출 요약 계산
      getUserExpenseSummary: () => {
        const { transactions, selectedMonth } = get();
        const currentMonthExpenses = transactions.filter((transaction) => {
          const transactionMonth = formatYearMonth(new Date(transaction.date));
          return (
            transactionMonth === selectedMonth && transaction.type === "expense"
          );
        });

        const userGroups = groupBy(currentMonthExpenses, "owner");

        return Object.entries(userGroups).map(([user, transactions]) => {
          const categoryGroups = groupBy(transactions, "category");
          const categoryBreakdown = Object.entries(categoryGroups).map(
            ([category, categoryTransactions]) => ({
              category,
              amount: sumBy(categoryTransactions, "amount"),
              percentage: calculatePercentage(
                sumBy(categoryTransactions, "amount"),
                sumBy(transactions, "amount")
              ),
              count: categoryTransactions.length,
            })
          );

          return {
            user: user as UserType,
            totalAmount: sumBy(transactions, "amount"),
            transactionCount: transactions.length,
            categoryBreakdown,
          };
        });
      },

      // 현재 월 거래 내역 조회
      getCurrentMonthTransactions: () => {
        const { transactions, selectedMonth } = get();
        return transactions.filter((transaction) => {
          const transactionMonth = formatYearMonth(new Date(transaction.date));
          return transactionMonth === selectedMonth;
        });
      },

      // 사용자별 거래 내역 조회
      getTransactionsByUser: (user: UserType) => {
        const { transactions, selectedMonth } = get();
        return transactions.filter((transaction) => {
          const transactionMonth = formatYearMonth(new Date(transaction.date));
          return (
            transactionMonth === selectedMonth && transaction.owner === user
          );
        });
      },
    }),
    {
      name: "budget-store",
      partialize: (state) => ({
        selectedUser: state.selectedUser,
        selectedMonth: state.selectedMonth,
      }),
    }
  )
);
