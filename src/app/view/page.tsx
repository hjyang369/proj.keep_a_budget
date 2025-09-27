"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/common/Layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Calendar from "@/components/common/Calendar";
import { useBudgetStore } from "@/store/useBudgetStore";
import { formatCurrency, formatDate, toLocalDateKey } from "@/lib/utils";
import { IDailySummary, UserType } from "@/types/budget";
import {
  Eye,
  Calendar as CalendarIcon,
  Filter,
  User,
  Grid3X3,
} from "lucide-react";
import TransactionCard from "@/components/common/transactionCard";

/**
 * 거래 내역 조회 페이지 컴포넌트
 *
 * @returns 거래 내역 조회 페이지 컴포넌트
 */
const ViewPage: React.FC = () => {
  const {
    getCurrentMonthTransactions,
    getTransactionsByUser,
    getCategorySummary,
    getUserExpenseSummary,
    selectedUser,
    setSelectedUser,
    selectedMonth,
    setSelectedMonth,
    loadTransactions,
    hydrate,
  } = useBudgetStore();

  // Hydration 처리
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const [viewMode, setViewMode] = useState<
    "all" | "user" | "category" | "calendar"
  >("calendar");

  /** 선택된 날짜 default : 오늘*/
  const [selectedDate, setSelectedDate] = useState<string>(
    toLocalDateKey(new Date())
  );

  // 현재 월 거래 내역
  const currentTransactions = getCurrentMonthTransactions();

  // 사용자별 거래 내역
  const userTransactions = getTransactionsByUser(selectedUser);

  // 카테고리별 요약
  const categorySummary = getCategorySummary();

  // 사용자별 지출 요약
  const userExpenseSummary = getUserExpenseSummary();

  // 표시할 거래 내역 결정
  const displayTransactions =
    viewMode === "user" ? userTransactions : currentTransactions;

  // 사용자 옵션
  const userOptions = [
    { value: "성욱", label: "성욱" },
    { value: "회진", label: "회진" },
  ];

  // 월 옵션 (최근 12개월)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toISOString().slice(0, 7);
    const label = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    return { value: month, label };
  });

  // 월 변경 핸들러
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    loadTransactions(month);
  };

  // 거래 내역을 날짜별로 그룹화
  const transactionsByDate = displayTransactions.reduce(
    (groups, transaction) => {
      const date = new Date(transaction.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {} as Record<string, typeof displayTransactions>
  );

  const [dailySummaryList, setDailySummaryList] = useState<
    Record<string, IDailySummary>
  >({});

  const getDailySummary = async () => {
    const res = await fetch(
      encodeURI(`/api/sheets/get/total/daily?sheetName=9월`)
    );
    if (res.status === 200) {
      const json = await res.json();
      console.log(json);
      setDailySummaryList(json.daily);
    }
  };

  useEffect(() => {
    getDailySummary();
  }, []);

  return (
    <Layout title="거래 내역 조회" description={`${selectedMonth} 거래 내역`}>
      <div className="space-y-6">
        {/* 필터 및 옵션 */}
        <Card title="조회 옵션">
          <div className="space-y-4">
            <Select
              label="조회 월"
              options={monthOptions}
              value={selectedMonth}
              onChange={handleMonthChange}
            />

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={viewMode === "all" ? "primary" : "outline"}
                size="small"
                onClick={() => setViewMode("all")}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                전체
              </Button>
              <Button
                variant={viewMode === "user" ? "primary" : "outline"}
                size="small"
                onClick={() => setViewMode("user")}
                className="flex-1"
              >
                <User className="w-4 h-4 mr-1" />
                사용자별
              </Button>
              <Button
                variant={viewMode === "category" ? "primary" : "outline"}
                size="small"
                onClick={() => setViewMode("category")}
                className="flex-1"
              >
                <Filter className="w-4 h-4 mr-1" />
                카테고리별
              </Button>
              <Button
                variant={viewMode === "calendar" ? "primary" : "outline"}
                size="small"
                onClick={() => setViewMode("calendar")}
                className="flex-1"
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                달력뷰
              </Button>
            </div>

            {viewMode === "user" && (
              <Select
                label="사용자 선택"
                options={userOptions}
                value={selectedUser}
                onChange={(value) => setSelectedUser(value as UserType)}
              />
            )}
          </div>
        </Card>

        {/* 카테고리별 요약 (카테고리 모드일 때) */}
        {viewMode === "category" && (
          <Card title="카테고리별 지출 현황">
            <div className="space-y-3">
              {categorySummary.map((category) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {category.category}
                    </p>
                    <p className="text-sm text-gray-500">
                      {category.count}건 • {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 사용자별 요약 (사용자 모드일 때) */}
        {viewMode === "user" && (
          <Card title={`${selectedUser}님의 지출 현황`}>
            <div className="space-y-3">
              {userExpenseSummary
                .filter((summary) => summary.user === selectedUser)
                .map((summary) => (
                  <div key={summary.user}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">총 지출</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(summary.totalAmount)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {summary.categoryBreakdown.map((category) => (
                        <div
                          key={category.category}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {category.category}
                          </span>
                          <span className="text-red-600">
                            {formatCurrency(category.amount)} (
                            {category.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* 달력뷰 */}
        {viewMode === "calendar" && (
          <Card title="달력뷰">
            <Calendar
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              dailySummary={dailySummaryList}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </Card>
        )}

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

        {/* 거래 내역 목록 (달력뷰가 아닐 때만 표시) */}
        {viewMode !== "calendar" && (
          <Card title={`거래 내역 (${displayTransactions.length}건)`}>
            {displayTransactions.length > 0 ? (
              <div className="space-y-4">
                {Object.entries(transactionsByDate)
                  .sort(
                    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
                  )
                  .map(([date, transactions]) => (
                    <div key={date}>
                      <div className="flex items-center mb-3">
                        <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
                        <h3 className="font-medium text-gray-900">
                          {formatDate(new Date(date))}
                        </h3>
                      </div>
                      <div className="space-y-2 ml-6">
                        {transactions
                          .sort(
                            (a, b) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime()
                          )
                          .map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {transaction.description}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {transaction.category} • {transaction.card} •{" "}
                                  {transaction.owner}
                                </p>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`font-semibold ${
                                    transaction.type === "입금"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {transaction.type === "입금" ? "+" : "-"}
                                  {formatCurrency(transaction.amount)}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">거래 내역이 없습니다</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ViewPage;
