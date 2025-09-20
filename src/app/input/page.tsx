"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/common/Layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useBudgetStore } from "@/store/useBudgetStore";
import { ITransactionInput, TransactionType } from "@/types/budget";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, AlertCircle } from "lucide-react";

/**
 * 거래 입력 페이지 컴포넌트
 *
 * @returns 거래 입력 페이지 컴포넌트
 */
const InputPage: React.FC = () => {
  const { addTransaction, adminConfig, isLoadingTransactions, hydrate } =
    useBudgetStore();

  // Hydration 처리
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 폼 상태
  const [formData, setFormData] = useState<ITransactionInput>({
    type: "expense",
    description: "",
    date: new Date().toISOString().split("T")[0],
    amount: 0,
    card: "",
    category: "",
  });

  // 폼 에러 상태
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // 거래 유형 옵션
  const transactionTypeOptions = [
    { value: "expense", label: "지출" },
    { value: "income", label: "입금" },
  ];
  // 결제수단 옵션
  const [paymentMethodList, setPaymentMethodList] = useState<string[]>([]);
  const cardOptions = paymentMethodList.map((card) => ({
    value: card,
    label: card,
  }));

  // 카테고리 옵션
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const categoryOptions = categoryList.map((category) => ({
    value: category,
    label: category,
  }));

  const getPaymentMethodList = async () => {
    const res = await fetch(
      encodeURI(`/api/sheets/get?sheetName=설정&range=A:A`)
    );
    if (res.status === 200) {
      const json = await res.json();
      setPaymentMethodList(json.values.slice(1));
    }
  };

  const getCategoryList = async () => {
    const res = await fetch(
      encodeURI(`/api/sheets/get?sheetName=설정&range=D:D`)
    );
    if (res.status === 200) {
      const json = await res.json();
      setCategoryList(json.values);
    }
  };

  useEffect(() => {
    getPaymentMethodList();
    getCategoryList();
  }, []);

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = "내용을 입력해주세요.";
    }

    if (!formData.date) {
      newErrors.date = "날짜를 선택해주세요.";
    }

    if (formData.amount <= 0) {
      newErrors.amount = "금액을 입력해주세요.";
    }

    if (!formData.card) {
      newErrors.card = "결제수단을 선택해주세요.";
    }

    if (!formData.category) {
      newErrors.category = "카테고리를 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const now = new Date();
      const transactionData: ITransactionInput = {
        ...formData,
        date: `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}`,
        amount: Number(formData.amount),
      };

      await onAppend(transactionData);

      // 폼 초기화
      setFormData({
        type: "expense",
        description: "",
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        card: "",
        category: "",
      });

      setSubmitStatus("success");
      setErrors({});
    } catch (error) {
      console.error("거래 내역 저장 실패:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 입력값 변경 핸들러
  const handleInputChange = (
    field: keyof ITransactionInput,
    value: string | number | Date
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 에러 상태 초기화
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("test");

  const onAppend = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/sheets/append", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: [
            values.type,
            values.category,
            values.amount,
            values.date,
            values.description,
            values.card,
          ],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "failed");
      setMsg("추가 성공!");
    } catch (err: any) {
      setMsg(`에러: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="거래 입력" description="새로운 거래 내역을 입력하세요">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 거래 유형 선택 */}
        <Card title="거래 유형">
          <Select
            label="거래 유형"
            options={transactionTypeOptions}
            value={formData.type}
            onChange={(value) =>
              handleInputChange("type", value as TransactionType)
            }
            required
            error={errors.type}
          />
        </Card>

        {/* 거래 정보 입력 */}
        <Card title="거래 정보">
          <div className="space-y-4">
            <Input
              label="내용"
              type="text"
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              placeholder="거래 내용을 입력하세요"
              required
              error={errors.description}
            />

            <Input
              label="날짜"
              type="date"
              value={
                formData.date instanceof Date
                  ? formData.date.toISOString().split("T")[0]
                  : formData.date
              }
              onChange={(value) => handleInputChange("date", new Date(value))}
              required
              error={errors.date}
            />

            <Input
              label="금액"
              type="number"
              value={formData.amount}
              onChange={(value) => handleInputChange("amount", Number(value))}
              placeholder="0"
              min={1}
              required
              error={errors.amount}
            />
          </div>
        </Card>

        {/* 결제수단 및 카테고리 */}
        <Card title="분류 정보">
          <div className="space-y-4">
            <Select
              label="결제수단"
              options={cardOptions}
              value={formData.card}
              onChange={(value) => handleInputChange("card", value)}
              placeholder="결제수단을 선택하세요"
              required
              error={errors.card}
            />

            <Select
              label="카테고리"
              options={categoryOptions}
              value={formData.category}
              onChange={(value) => handleInputChange("category", value)}
              placeholder="카테고리를 선택하세요"
              required
              error={errors.category}
            />
          </div>
        </Card>

        {/* 제출 상태 표시 */}
        {submitStatus === "success" && (
          <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700">
              거래 내역이 성공적으로 저장되었습니다!
            </span>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">
              거래 내역 저장에 실패했습니다. 다시 시도해주세요.
            </span>
          </div>
        )}

        {/* 제출 버튼 */}
        <Button
          type="submit"
          variant="primary"
          size="large"
          disabled={isSubmitting || isLoadingTransactions}
          className="w-full"
        >
          {isSubmitting ? "저장 중..." : "거래 내역 저장"}
        </Button>
      </form>
    </Layout>
  );
};

export default InputPage;
