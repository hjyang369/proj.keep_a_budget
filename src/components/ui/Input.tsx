import React from "react";
import { cn } from "@/lib/utils";

/**
 * 입력 컴포넌트의 props 인터페이스
 */
interface IInputProps {
  /** 입력 필드 라벨 */
  label?: string;
  /** 입력 필드 타입 */
  type?: "text" | "email" | "password" | "number" | "date" | "tel";
  /** 입력 필드 값 */
  value?: string | number;
  /** 값 변경 시 실행될 함수 */
  onChange?: (value: string) => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 입력 필드 비활성화 여부 */
  disabled?: boolean;
  /** 필수 입력 여부 */
  required?: boolean;
  /** 에러 메시지 */
  error?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 입력 필드 이름 */
  name?: string;
  /** 최소값 (number 타입일 때) */
  min?: number;
  /** 최대값 (number 타입일 때) */
  max?: number;
  /** 단계값 (number 타입일 때) */
  step?: number;
}

/**
 * 다양한 타입을 지원하는 입력 컴포넌트
 *
 * @param props - 입력 컴포넌트 props
 * @returns 입력 컴포넌트
 */
const Input: React.FC<IInputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
  className,
  name,
  min,
  max,
  step,
}) => {
  // 입력 필드 스타일 클래스 생성
  const inputClasses = cn(
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-50 focus:border-primary-50 transition-colors",
    "disabled:bg-gray-100 disabled:cursor-not-allowed",
    error && "border-red-500 focus:ring-red-500 focus:border-red-500",
    className
  );

  // 값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        name={name}
        min={min}
        max={max}
        step={step}
        className={inputClasses}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
