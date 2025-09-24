"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/common/Layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
// import NotificationSettings from "@/components/sections/NotificationSettings";
import { useBudgetStore } from "@/store/useBudgetStore";
import { IAdminConfig, ICategory } from "@/types/budget";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Save,
  Settings,
  CreditCard,
  Tag,
  Target,
  CheckCircle,
  AlertCircle,
  Bell,
  Sliders,
} from "lucide-react";

/**
 * 탭 타입 정의
 */
type TabType = "general" | "notifications";

/**
 * 관리 설정 페이지 컴포넌트
 *
 * @returns 관리 설정 페이지 컴포넌트
 */
const AdminPage: React.FC = () => {
  const {
    adminConfig,
    updateAdminConfig,
    loadAdminConfig,
    isLoadingConfig,
    hydrate,
  } = useBudgetStore();

  // 탭 상태
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // 로컬 상태
  const [localConfig, setLocalConfig] = useState<IAdminConfig>(adminConfig);
  const [newCard, setNewCard] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryBudget, setNewCategoryBudget] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  // Hydration 처리 및 설정 로드
  useEffect(() => {
    hydrate();
    loadAdminConfig();
  }, [hydrate, loadAdminConfig]);

  // adminConfig 변경 시 로컬 상태 업데이트
  useEffect(() => {
    setLocalConfig(adminConfig);
  }, [adminConfig]);

  const [paymentMethodList, setPaymentMethodList] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<ICategory[]>([]);

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
      encodeURI(`/api/sheets/get/category?sheetName=설정&range=D:F`)
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

  // 결제수단 추가
  const handleAddCard = () => {
    if (newCard.trim() && !localConfig.cards.includes(newCard.trim())) {
      setLocalConfig((prev) => ({
        ...prev,
        cards: [...prev.cards, newCard.trim()],
      }));
      setNewCard("");
    }
  };

  // 결제수단 삭제
  const handleRemoveCard = (cardToRemove: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      cards: prev.cards.filter((card) => card !== cardToRemove),
    }));
  };

  // 카테고리 추가
  const handleAddCategory = () => {
    if (
      newCategory.trim() &&
      !localConfig.categories.includes(newCategory.trim())
    ) {
      setLocalConfig((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }));
      setNewCategory("");
    }
  };

  // 카테고리 삭제
  const handleRemoveCategory = (categoryToRemove: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      categories: prev.categories.filter(
        (category) => category !== categoryToRemove
      ),
      categoryBudgets: Object.fromEntries(
        Object.entries(prev.categoryBudgets).filter(
          ([key]) => key !== categoryToRemove
        )
      ),
    }));
  };

  // 카테고리별 예산 설정
  const handleCategoryBudgetChange = (category: string, budget: number) => {
    setLocalConfig((prev) => ({
      ...prev,
      categoryBudgets: {
        ...prev.categoryBudgets,
        [category]: budget,
      },
    }));
  };

  // 설정 저장
  const handleSave = async () => {
    try {
      await updateAdminConfig(localConfig);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("설정 저장 실패:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  // 변경사항 확인
  const hasChanges =
    JSON.stringify(localConfig) !== JSON.stringify(adminConfig);

  /**
   * 탭 버튼 컴포넌트
   */
  const TabButton: React.FC<{
    tab: TabType;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
  }> = ({ tab, icon, label, isActive }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? "bg-primary-100 text-primary-700 border border-primary-200"
          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  /**
   * 일반 설정 탭 컨텐츠
   */
  const GeneralSettingsContent = () => (
    <div className="space-y-6">
      {/* 저장 상태 표시 */}
      {saveStatus === "success" && (
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-700">
            설정이 성공적으로 저장되었습니다!
          </span>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">
            설정 저장에 실패했습니다. 다시 시도해주세요.
          </span>
        </div>
      )}

      {/* 결제수단 관리 */}
      <Card title="결제수단 관리">
        <div className="space-y-4">
          {/* 결제수단 추가 */}
          <div className="flex space-x-2">
            <Input
              placeholder="새 결제수단 입력"
              value={newCard}
              onChange={setNewCard}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleAddCard}
              disabled={!newCard.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* 결제수단 목록 */}
          <div className="space-y-2">
            {paymentMethodList.map((card) => (
              <div
                key={card}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">{card}</span>
                </div>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleRemoveCard(card)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 카테고리 관리 */}
      <Card title="카테고리 관리">
        <div className="space-y-4">
          {/* 카테고리 추가 */}
          <div className="flex space-x-2">
            <Input
              placeholder="새 카테고리 입력"
              value={newCategory}
              onChange={setNewCategory}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleAddCategory}
              disabled={!newCategory.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* 카테고리 목록 */}
          <div className="space-y-2">
            {categoryList.map((category) => (
              <div
                key={category?.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <Tag className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">
                    {category?.name}
                  </span>
                </div>
                <Button
                  variant="danger"
                  size="small"
                  // onClick={() => handleRemoveCategory(category)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 월별 예산 설정 */}
      <Card title="월별 예산 설정">
        <div className="space-y-4">
          <Input
            label="이번 달 총 예산"
            type="number"
            value={localConfig.monthlyBudget.toString()}
            onChange={(value) =>
              setLocalConfig((prev) => ({
                ...prev,
                monthlyBudget: Number(value) || 0,
              }))
            }
            placeholder="0"
          />

          <div className="text-sm text-gray-600">
            현재 설정된 총 예산: {formatCurrency(localConfig.monthlyBudget)}
          </div>
        </div>
      </Card>

      {/* 카테고리별 예산 설정 */}
      <Card title="카테고리별 예산 설정">
        <div className="space-y-4">
          {categoryList.map((category) => (
            <div
              key={category?.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <Target className="w-4 h-4 text-gray-500 mr-2" />
                <span className="font-medium text-gray-900">
                  {category?.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={(category?.budget || 0).toString()}
                  // onChange={(value) =>
                  //   handleCategoryBudgetChange(category, Number(value) || 0)
                  // }
                  placeholder="0"
                  className="w-32"
                />
                <span className="text-sm text-gray-500">원</span>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                카테고리별 예산 합계
              </span>
              <span className="font-semibold text-primary-50">
                {/* {formatCurrency(
                  categoryList.reduce((sum, budget) => sum + budget, 0)
                )} */}
                0
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!hasChanges || isLoadingConfig}
          className="flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoadingConfig ? "저장 중..." : "설정 저장"}
        </Button>
      </div>

      {/* 변경사항 알림 */}
      {hasChanges && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-700 text-sm">
              변경사항이 있습니다. 저장 버튼을 눌러 설정을 저장하세요.
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout
      title="설정 관리"
      description="결제수단, 카테고리, 예산 및 알림을 관리하세요"
    >
      <div className="space-y-6">
        {/* 탭 네비게이션 */}
        <div className="flex space-x-2 border-b border-gray-200 pb-4">
          <TabButton
            tab="general"
            icon={<Sliders className="w-4 h-4" />}
            label="일반 설정"
            isActive={activeTab === "general"}
          />
          <TabButton
            tab="notifications"
            icon={<Bell className="w-4 h-4" />}
            label="알림 설정"
            isActive={activeTab === "notifications"}
          />
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === "general" && <GeneralSettingsContent />}
        {/* {activeTab === "notifications" && <NotificationSettings />} */}
      </div>
    </Layout>
  );
};

export default AdminPage;
