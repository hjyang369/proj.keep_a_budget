"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/common/Layout";
import Card from "@/components/ui/Card";
import ClientOnly from "@/components/common/ClientOnly";
import Calendar from "@/components/common/Calendar";
import { useBudgetStore } from "@/store/useBudgetStore";
import { formatCurrency, toLocalDateKey } from "@/lib/utils";
import { IDailySummary, IMonthlySummary } from "@/types/budget";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Eye,
  BarChart3,
  Settings,
} from "lucide-react";
import Link from "next/link";
import TransactionCard from "@/components/common/transactionCard";

const HomePage: React.FC = () => {
  const { initializeData, hydrate, setSelectedMonth, loadTransactions } =
    useBudgetStore();

  // 컴포넌트 마운트 시 데이터 초기화 및 hydration 처리
  useEffect(() => {
    if (typeof window !== "undefined") {
      hydrate();
      initializeData();
    }
  }, [hydrate, initializeData]);

  // 이번 달 총입금, 총지출, 순수익
  const [monthlySummary, setMonthlySummary] = useState<IMonthlySummary>({
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
  });

  /** 선택된 날짜 (default: 오늘) (YYYY-MM-DD)*/
  const [selectedDate, setSelectedDate] = useState<string>(
    toLocalDateKey(new Date())
  );
  const [year, month, day] = selectedDate.split("-");
  const monthKey = parseInt(month, 10).toString();
  // 일별 요약 데이터
  const [dailySummaryList, setDailySummaryList] = useState<
    Record<string, IDailySummary>
  >({});

  // 이번 달 총입금, 총지출, 순수익 조회
  const getMonthTotalExpense = async () => {
    const res = await fetch(
      encodeURI(`/api/sheets/get/total/month?sheetName=${monthKey}`)
    );
    if (res.status === 200) {
      const json = await res.json();
      setMonthlySummary(json);
    }
  };

  // 일별 조회
  const getDailySummary = async () => {
    const res = await fetch(
      encodeURI(`/api/sheets/get/total/daily?sheetName=${monthKey}`)
    );
    if (res.status === 200) {
      const json = await res.json();
      setDailySummaryList(json.daily);
    }
  };

  useEffect(() => {
    getMonthTotalExpense();
    getDailySummary();
  }, [month]);

  // 월 변경 핸들러
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    loadTransactions(month);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* 월별 요약 카드 */}
        <Card title={`${year}년 ${monthKey}월 요약`}>
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
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">저축</span>
              <span
                className={`text-lg font-bold ${
                  monthlySummary.netIncome >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {/* TODO 저축 내역 추가 */}
                {formatCurrency(monthlySummary.netIncome)}
              </span>
            </div>
          </div>
        </Card>

        {/* 달력뷰 */}
        <Calendar
          selectedMonth={month}
          selectedYear={year}
          onMonthChange={handleMonthChange}
          dailySummary={dailySummaryList}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        {/* 선택된 날짜의 거래 내역 */}
        {selectedDate && (
          <Card title={`${selectedDate}의 거래 내역`}>
            <div className="space-y-4">
              {dailySummaryList[selectedDate]?.detail ? (
                dailySummaryList[selectedDate]?.detail?.map(
                  (transaction, idx) => {
                    return (
                      <TransactionCard
                        key={transaction.id + idx}
                        transaction={transaction}
                      />
                    );
                  }
                )
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">거래 내역이 없습니다</p>
                </div>
              )}
            </div>
          </Card>
        )}

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
