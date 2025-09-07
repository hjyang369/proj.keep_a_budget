"use client";

import React, { useEffect } from "react";
import Layout from "@/components/common/Layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useBudgetStore } from "@/store/useBudgetStore";
import { formatCurrency, calculatePercentage } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  PieChart,
  DollarSign,
} from "lucide-react";

/**
 * 지출 분석 페이지 컴포넌트
 *
 * @returns 지출 분석 페이지 컴포넌트
 */
const AnalysisPage: React.FC = () => {
  const {
    getMonthlySummary,
    getCategorySummary,
    getUserExpenseSummary,
    generateAnalysis,
    analysisResult,
    isLoadingAnalysis,
    adminConfig,
    selectedMonth,
    hydrate,
  } = useBudgetStore();

  // Hydration 처리 및 분석 실행
  useEffect(() => {
    hydrate();
    generateAnalysis();
  }, [hydrate, generateAnalysis]);

  const monthlySummary = getMonthlySummary();
  const categorySummary = getCategorySummary();
  const userExpenseSummary = getUserExpenseSummary();

  // 예산 대비 지출 비율 계산
  const budgetUsageRatio =
    adminConfig.monthlyBudget > 0 && monthlySummary
      ? calculatePercentage(
          monthlySummary.totalExpense,
          adminConfig.monthlyBudget
        )
      : 0;

  // 가장 많이 지출한 카테고리
  const topCategory = categorySummary[0];

  // 사용자별 지출 비교
  const totalUserExpense = userExpenseSummary.reduce(
    (sum, user) => sum + user.totalAmount,
    0
  );

  return (
    <Layout title="지출 분석" description={`${selectedMonth} 지출 패턴 분석`}>
      <div className="space-y-6">
        {/* 분석 새로고침 버튼 */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="small"
            onClick={generateAnalysis}
            disabled={isLoadingAnalysis}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {isLoadingAnalysis ? "분석 중..." : "분석 새로고침"}
          </Button>
        </div>

        {/* 예산 대비 지출 현황 */}
        {monthlySummary && (
          <Card title="예산 대비 지출 현황">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이번 달 예산</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(adminConfig.monthlyBudget)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">실제 지출</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(monthlySummary.totalExpense)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">예산 사용률</span>
                <span
                  className={`font-semibold ${
                    budgetUsageRatio > 100
                      ? "text-red-600"
                      : budgetUsageRatio > 80
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {budgetUsageRatio.toFixed(1)}%
                </span>
              </div>

              {/* 예산 사용률 프로그레스 바 */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    budgetUsageRatio > 100
                      ? "bg-red-500"
                      : budgetUsageRatio > 80
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(budgetUsageRatio, 100)}%` }}
                />
              </div>

              {budgetUsageRatio > 100 && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">
                    예산을{" "}
                    {formatCurrency(
                      monthlySummary.totalExpense - adminConfig.monthlyBudget
                    )}{" "}
                    초과했습니다.
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 카테고리별 지출 분석 */}
        <Card title="카테고리별 지출 분석">
          <div className="space-y-4">
            {categorySummary.slice(0, 5).map((category, index) => {
              const budget =
                adminConfig.categoryBudgets[category.category] || 0;
              const isOverBudget = budget > 0 && category.amount > budget;
              const usageRatio =
                budget > 0 ? calculatePercentage(category.amount, budget) : 0;

              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-primary-50 text-gray-900 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {category.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-red-600">
                        {formatCurrency(category.amount)}
                      </span>
                      <p className="text-xs text-gray-500">
                        {category.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {budget > 0 && (
                    <div className="ml-9 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          예산: {formatCurrency(budget)}
                        </span>
                        <span
                          className={`font-medium ${
                            isOverBudget ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {usageRatio.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isOverBudget ? "bg-red-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(usageRatio, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* 사용자별 지출 비교 */}
        <Card title="사용자별 지출 비교">
          <div className="space-y-4">
            {userExpenseSummary.map((user) => {
              const userRatio =
                totalUserExpense > 0
                  ? calculatePercentage(user.totalAmount, totalUserExpense)
                  : 0;

              return (
                <div key={user.user} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {user.user}님
                    </span>
                    <div className="text-right">
                      <span className="font-semibold text-red-600">
                        {formatCurrency(user.totalAmount)}
                      </span>
                      <p className="text-xs text-gray-500">
                        {userRatio.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-red-500 rounded-full transition-all duration-300"
                      style={{ width: `${userRatio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 분석 결과 및 추천 */}
        {analysisResult && (
          <Card title="분석 결과 및 추천">
            <div className="space-y-4">
              {/* 과소비 카테고리 */}
              {analysisResult.overspentCategories.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">
                        과소비 카테고리
                      </h4>
                      <p className="text-yellow-700 text-sm">
                        {analysisResult.overspentCategories.join(", ")}{" "}
                        카테고리에서 예산을 초과했습니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 절약 팁 */}
              {analysisResult.savingTips.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <Lightbulb className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">
                        다음 달 절약 팁
                      </h4>
                      <ul className="space-y-1">
                        {analysisResult.savingTips.map((tip, index) => (
                          <li key={index} className="text-blue-700 text-sm">
                            • {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* 예산 초과 알림 */}
              {analysisResult.budgetExceeded > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <Target className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">
                        예산 초과
                      </h4>
                      <p className="text-red-700 text-sm">
                        이번 달 총 지출이 예산을{" "}
                        {formatCurrency(analysisResult.budgetExceeded)}{" "}
                        초과했습니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 긍정적인 피드백 */}
              {analysisResult.budgetExceeded === 0 &&
                analysisResult.overspentCategories.length === 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <TrendingUp className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800 mb-1">
                          잘하고 있어요!
                        </h4>
                        <p className="text-green-700 text-sm">
                          이번 달은 예산 내에서 잘 관리하고 있습니다. 계속
                          이렇게 관리해보세요!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </Card>
        )}

        {/* 요약 통계 */}
        <Card title="요약 통계">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">총 거래 건수</p>
              <p className="text-lg font-semibold text-gray-900">
                {categorySummary.reduce((sum, cat) => sum + cat.count, 0)}건
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <PieChart className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">활성 카테고리</p>
              <p className="text-lg font-semibold text-gray-900">
                {categorySummary.length}개
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AnalysisPage;
