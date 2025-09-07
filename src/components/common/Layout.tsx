import React from "react";
import { cn } from "@/lib/utils";
import Navigation from "./Navigation";

/**
 * 레이아웃 컴포넌트의 props 인터페이스
 */
interface ILayoutProps {
  /** 페이지 내용 */
  children: React.ReactNode;
  /** 페이지 제목 */
  title?: string;
  /** 페이지 설명 */
  description?: string;
  /** 네비게이션 숨김 여부 */
  hideNavigation?: boolean;
}

/**
 * 공통 레이아웃 컴포넌트
 *
 * @param props - 레이아웃 컴포넌트 props
 * @returns 레이아웃 컴포넌트
 */
const Layout: React.FC<ILayoutProps> = ({
  children,
  title,
  description,
  hideNavigation = false,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 콘텐츠 */}
      <main className="max-w-md mx-auto bg-white min-h-screen">
        {/* 헤더 */}
        {(title || description) && (
          <header className="bg-white border-b border-gray-200 px-4 py-6">
            <div className="space-y-1">
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              )}
              {description && <p className="text-gray-600">{description}</p>}
            </div>
          </header>
        )}

        {/* 페이지 콘텐츠 */}
        <div
          className={cn(
            "px-4 py-6",
            !hideNavigation && "pb-20" // 네비게이션 공간 확보
          )}
        >
          {children}
        </div>
      </main>

      {/* 하단 네비게이션 */}
      {!hideNavigation && <Navigation />}
    </div>
  );
};

export default Layout;
