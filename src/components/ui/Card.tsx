import React from "react";
import { cn } from "@/lib/utils";

/**
 * 카드 컴포넌트의 props 인터페이스
 */
interface ICardProps {
  /** 카드 내용 */
  children: React.ReactNode;
  /** 카드 제목 */
  title?: string;
  /** 카드 설명 */
  description?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 카드 클릭 시 실행될 함수 */
  onClick?: () => void;
  /** 카드 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 카드 형태의 컨테이너 컴포넌트
 *
 * @param props - 카드 컴포넌트 props
 * @returns 카드 컴포넌트
 */
const Card: React.FC<ICardProps> = ({
  children,
  title,
  description,
  className,
  onClick,
  disabled = false,
}) => {
  // 카드 스타일 클래스 생성
  const cardClasses = cn(
    "bg-white rounded-lg border border-gray-200 shadow-sm p-6",
    "transition-shadow hover:shadow-md",
    onClick && !disabled && "cursor-pointer hover:shadow-lg",
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  return (
    <div
      className={cardClasses}
      onClick={disabled ? undefined : onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && !disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default Card;
