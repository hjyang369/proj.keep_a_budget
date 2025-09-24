"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PlusCircle, Eye, BarChart3, Settings, Home } from "lucide-react";
import ClientOnly from "./ClientOnly";

/**
 * 네비게이션 아이템 인터페이스
 */
interface INavigationItem {
  /** 아이템 라벨 */
  label: string;
  /** 아이템 경로 */
  href: string;
  /** 아이콘 컴포넌트 */
  icon: React.ComponentType<{ className?: string }>;
  /** 설명 */
  description: string;
}

/**
 * 네비게이션 아이템 목록
 */
const navigationItems: INavigationItem[] = [
  {
    label: "홈",
    href: "/",
    icon: Home,
    description: "메인 페이지",
  },
  {
    label: "입력",
    href: "/input",
    icon: PlusCircle,
    description: "거래 내역 입력",
  },
  {
    label: "보기",
    href: "/view",
    icon: Eye,
    description: "거래 내역 조회",
  },
  {
    label: "분석",
    href: "/analysis",
    icon: BarChart3,
    description: "지출 분석",
  },
  {
    label: "관리",
    href: "/admin",
    icon: Settings,
    description: "설정 관리",
  },
];

/**
 * 하단 네비게이션 컴포넌트
 *
 * @returns 네비게이션 컴포넌트
 */
const Navigation: React.FC = () => {
  return (
    <ClientOnly
      fallback={
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
          <div className="max-w-md mx-auto">
            <div className="flex justify-around items-center">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.href}
                    className="flex flex-col items-center justify-center p-2 rounded-lg min-w-0 flex-1 text-gray-600"
                  >
                    <Icon className="w-5 h-5 mb-1 text-gray-500" />
                    <span className="text-xs font-medium truncate w-full text-center text-gray-600">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      }
    >
      <NavigationContent />
    </ClientOnly>
  );
};

/**
 * 네비게이션 컨텐츠 (클라이언트에서만 렌더링)
 */
const NavigationContent: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
                  "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-50",
                  isActive
                    ? "text-green-600 bg-primary-50/10"
                    : "text-gray-600 hover:text-gray-900"
                )}
                aria-label={item.description}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 mb-1",
                    isActive ? "text-green-600" : "text-gray-500"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium truncate w-full text-center",
                    isActive ? "text-green-600" : "text-gray-600"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
