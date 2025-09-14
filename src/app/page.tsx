"use client";

import React, { useEffect } from "react";
import Layout from "@/components/common/Layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ClientOnly from "@/components/common/ClientOnly";
import { useBudgetStore } from "@/store/useBudgetStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ITransactionView } from "@/types/budget";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowRight,
  PlusCircle,
  Eye,
  BarChart3,
  Settings,
} from "lucide-react";
import Link from "next/link";

/**
 * 오늘의 거래 컴포넌트 props
 */
interface ITodayTransactionsProps {
  transactions: ITransactionView[];
}

/**
 * 오늘의 거래 컴포넌트 (클라이언트에서만 렌더링)
 */
const TodayTransactions: React.FC<ITodayTransactionsProps> = ({
  transactions,
}) => {
  const today = new Date();
  const todayString = today.toDateString();
  const todayTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.toDateString() === todayString;
  });

  return todayTransactions.length > 0 ? (
    <div className="space-y-3">
      {todayTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {transaction.description}
            </p>
            <p className="text-sm text-gray-500">
              {transaction.category} • {transaction.card}
            </p>
          </div>
          <span
            className={`font-semibold ${
              transaction.type === "income" ? "text-green-600" : "text-red-600"
            }`}
          >
            {transaction.type === "income" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-4">
      <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
      <p className="text-gray-500">오늘은 아직 거래 내역이 없습니다</p>
    </div>
  );
};

/**
 * 메인 홈 페이지 컴포넌트
 *
 * @returns 홈 페이지 컴포넌트
 */
const HomePage: React.FC = () => {
  const {
    getMonthlySummary,
    getCurrentMonthTransactions,
    initializeData,
    selectedMonth,
    hydrate,
  } = useBudgetStore();

  // 컴포넌트 마운트 시 데이터 초기화 및 hydration 처리
  useEffect(() => {
    if (typeof window !== "undefined") {
      hydrate();
      initializeData();
    }
  }, [hydrate, initializeData]);

  const monthlySummary = selectedMonth ? getMonthlySummary() : null;
  const currentTransactions = selectedMonth
    ? getCurrentMonthTransactions()
    : [];

  // 최근 거래 내역 (최대 5개)
  const recentTransactions = currentTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Layout
      title="공용 가계부"
      description={selectedMonth ? `${selectedMonth} 가계 현황` : "가계 현황"}
    >
      <div className="space-y-6">
        {/* 월별 요약 카드 */}
        {monthlySummary && (
          <Card title="이번 달 요약">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-1" />
                  <span className="text-sm text-gray-600">총 입금</span>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(monthlySummary.totalIncome)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingDown className="w-5 h-5 text-red-500 mr-1" />
                  <span className="text-sm text-gray-600">총 지출</span>
                </div>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(monthlySummary.totalExpense)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">순수익</span>
                <span
                  className={`text-lg font-bold ${
                    monthlySummary.netIncome >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(monthlySummary.netIncome)}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* 오늘의 거래 */}
        <Card title="오늘의 거래">
          <ClientOnly
            fallback={
              <div className="text-center py-4">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">로딩 중...</p>
              </div>
            }
          >
            <TodayTransactions transactions={currentTransactions} />
          </ClientOnly>
        </Card>

        {/* 최근 거래 내역 */}
        {recentTransactions.length > 0 && (
          <Card title="최근 거래 내역">
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.date)} • {transaction.category} •{" "}
                      {transaction.card}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link href="/view">
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  전체 내역 보기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* 빠른 액션 버튼들 */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/input">
            <Button variant="primary" className="w-full">
              <PlusCircle className="w-4 h-4 mr-2" />
              거래 입력
            </Button>
          </Link>
          <Link href="/analysis">
            <Button variant="secondary" className="w-full">
              <BarChart3 className="w-4 h-4 mr-2" />
              분석 보기
            </Button>
          </Link>
        </div>

        {/* 빠른 링크 */}
        <Card title="빠른 링크">
          <div className="space-y-2">
            <Link href="/analysis">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="font-medium">지출 분석</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
            <Link href="/admin">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Settings className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="font-medium">설정</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default HomePage;
