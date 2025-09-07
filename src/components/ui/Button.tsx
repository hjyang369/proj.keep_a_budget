import React from "react";
import { cn } from "@/lib/utils";

/**
 * 버튼 컴포넌트의 props 인터페이스
 */
interface IButtonProps {
  /** 버튼에 표시될 텍스트 */
  children: React.ReactNode;
  /** 버튼 클릭 시 실행될 함수 */
  onClick?: () => void;
  /** 버튼의 종류 */
  variant?: "primary" | "secondary" | "danger" | "outline";
  /** 버튼 비활성화 여부 */
  disabled?: boolean;
  /** 버튼의 크기 */
  size?: "small" | "medium" | "large";
  /** 버튼 타입 */
  type?: "button" | "submit" | "reset";
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 다양한 스타일과 크기를 지원하는 버튼 컴포넌트
 *
 * @param props - 버튼 컴포넌트 props
 * @returns 버튼 컴포넌트
 */
const Button: React.FC<IButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  size = "medium",
  type = "button",
  className,
}) => {
  // 버튼 스타일 클래스 생성
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-primary-50 text-gray-900 hover:bg-primary-100 focus:ring-primary-50",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300",
  };

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
