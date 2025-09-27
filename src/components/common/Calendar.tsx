"use client";

import React, { useState } from "react";
import { formatCurrency, toLocalDateKey } from "@/lib/utils";
import { IDailySummary } from "@/types/budget";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 달력 컴포넌트의 props 인터페이스
 */
interface ICalendarProps {
  /** 선택된 월 (YYYY-MM 형식) */
  selectedMonth: string;
  /** 월 변경 핸들러 */
  onMonthChange: (month: string) => void;
  /** 일별 요약 데이터 */
  dailySummary: Record<string, IDailySummary>;
  /** 선택된 날짜 */
  selectedDate: string;
  /** 선택된 날짜 변경 핸들러 */
  setSelectedDate: (date: string) => void;
}

/**
 * 거래 내역을 달력 형태로 표시하는 컴포넌트
 *
 * @param props - 달력 컴포넌트 props
 * @returns 달력 컴포넌트
 */
const Calendar: React.FC<ICalendarProps> = ({
  selectedMonth,
  onMonthChange,
  dailySummary,
  selectedDate,
  setSelectedDate,
}) => {
  // 선택된 월의 첫째 날과 마지막 날 계산
  const currentDate = new Date(selectedMonth + "-01");
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay(); // 0: 일요일, 1: 월요일, ...

  // 달력에 표시할 날짜들 생성
  const calendarDays: (Date | null)[] = [];

  // 이전 달의 마지막 날들 (빈 칸 채우기)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(firstDay);
    prevDate.setDate(prevDate.getDate() - i - 1);
    calendarDays.push(prevDate);
  }

  // 현재 달의 모든 날들
  for (let day = 1; day <= lastDay.getDate(); day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // 다음 달의 첫째 날들 (빈 칸 채우기)
  const remainingDays = 35 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const nextDate = new Date(year, month + 1, day);
    calendarDays.push(nextDate);
  }

  // 월 변경 핸들러
  const handlePrevMonth = () => {
    const prevDate = new Date(currentDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    onMonthChange(prevDate.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    onMonthChange(nextDate.toISOString().slice(0, 7));
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  // 요일 헤더
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* 달력 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="이전 달"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900">
          {year}년 {month + 1}월
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="다음 달"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, index) => {
          if (!date) return <div key={index} className="h-24" />;

          const isCurrentMonth = date.getMonth() === month;
          const dateKey = toLocalDateKey(date); // 달력 날짜
          const todayKey = toLocalDateKey(new Date()); // 오늘 날짜
          const isToday = dateKey === todayKey;
          const summary = dailySummary[dateKey]; // 일별 요약 데이터

          const defaultFontColor = isCurrentMonth
            ? "text-gray-900"
            : "text-gray-400";

          return (
            <div
              key={dateKey + index}
              className={`
                h-24 p-2 border-r border-b border-gray-100 cursor-pointer
                transition-colors
                ${!isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white"}
                ${isToday ? "bg-blue-50 border-blue-200" : ""}
                ${
                  selectedDate === dateKey
                    ? "bg-blue-100 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                }
              `}
              onClick={() => handleDateClick(dateKey)}
            >
              <div className="flex flex-col h-full">
                {/* 날짜 */}
                <div
                  className={`
                    text-sm font-medium mb-1
                    ${isToday ? "text-blue-600" : defaultFontColor}
                  `}
                >
                  {date.getDate()}
                </div>

                {/* 거래 내역 요약 */}
                {summary && isCurrentMonth && (
                  <div className="flex-1 space-y-1">
                    {summary.totalIncome > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        {summary.totalIncome}
                      </div>
                    )}
                    {summary.totalExpense > 0 && (
                      <div className="text-xs text-red-600 font-medium">
                        {summary.totalExpense}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
