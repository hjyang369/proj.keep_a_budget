import React from "react";
import { cn } from "@/lib/utils";

/**
 * 선택 옵션 인터페이스
 */
interface ISelectOption {
  /** 옵션 값 */
  value: string;
  /** 옵션 라벨 */
  label: string;
  /** 옵션 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 셀렉트 컴포넌트의 props 인터페이스
 */
interface ISelectProps {
  /** 셀렉트 라벨 */
  label?: string;
  /** 선택 옵션 목록 */
  options: ISelectOption[];
  /** 현재 선택된 값 */
  value?: string;
  /** 값 변경 시 실행될 함수 */
  onChange?: (value: string) => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 셀렉트 비활성화 여부 */
  disabled?: boolean;
  /** 필수 선택 여부 */
  required?: boolean;
  /** 에러 메시지 */
  error?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 셀렉트 이름 */
  name?: string;
}

/**
 * 드롭다운 선택을 지원하는 셀렉트 컴포넌트
 *
 * @param props - 셀렉트 컴포넌트 props
 * @returns 셀렉트 컴포넌트
 */
const Select: React.FC<ISelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
  className,
  name,
}) => {
  // 셀렉트 스타일 클래스 생성
  const selectClasses = cn(
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-50 focus:border-primary-50 transition-colors",
    "disabled:bg-gray-100 disabled:cursor-not-allowed",
    error && "border-red-500 focus:ring-red-500 focus:border-red-500",
    className
  );

  // 값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      <select
        id={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        name={name}
        className={selectClasses}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
