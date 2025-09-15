"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { usePushNotification } from "@/hooks/usePushNotification";
import { NotificationType } from "@/types/budget";
import {
  Bell,
  BellOff,
  Clock,
  Shield,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertCircle,
  Settings,
  Play,
  Info,
  Moon,
  Sun,
  Percent,
} from "lucide-react";

/**
 * 알림 타입 한글 이름 매핑
 */
const notificationTypeNames: Record<NotificationType, string> = {
  budget_exceeded: "예산 초과 알림",
  budget_warning: "예산 경고 알림",
  daily_summary: "일별 요약 알림",
  weekly_summary: "주별 요약 알림",
  monthly_summary: "월별 요약 알림",
  expense_reminder: "지출 입력 알림",
};

/**
 * 알림 타입 설명 매핑
 */
const notificationTypeDescriptions: Record<NotificationType, string> = {
  budget_exceeded: "설정한 예산을 초과했을 때 알림을 받습니다",
  budget_warning: "예산 한계에 근접했을 때 미리 경고 알림을 받습니다",
  daily_summary: "매일 정해진 시간에 하루 지출 요약을 받습니다",
  weekly_summary: "매주 일요일에 주간 지출 요약을 받습니다",
  monthly_summary: "매월 1일에 월별 지출 요약을 받습니다",
  expense_reminder: "매일 정해진 시간에 지출 입력 알림을 받습니다",
};

/**
 * 시간 입력 컴포넌트
 */
interface ITimeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const TimeInput: React.FC<ITimeInputProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <div className="flex items-center space-x-1">
      <Clock className="w-4 h-4 text-gray-400" />
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="px-2 py-1 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  );
};

/**
 * 백분율 입력 컴포넌트
 */
interface IPercentInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}

const PercentInput: React.FC<IPercentInputProps> = ({
  value,
  onChange,
  disabled,
  min = 0,
  max = 100,
}) => {
  return (
    <div className="flex items-center space-x-1">
      <Percent className="w-4 h-4 text-gray-400" />
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        min={min}
        max={max}
        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <span className="text-sm text-gray-500">%</span>
    </div>
  );
};

/**
 * 알림 설정 컴포넌트
 *
 * @returns 알림 설정 컴포넌트
 */
const NotificationSettings: React.FC = () => {
  const {
    settings,
    isLoading,
    error,
    isQuietTime,
    requestPermission,
    sendTestNotification,
    clearError,
    isSupported,
    hasPermission,
    isEnabled,
  } = usePushNotification();

  const [expandedType, setExpandedType] = useState<NotificationType | null>(
    null
  );

  /**
   * 토글 스위치 컴포넌트
   */
  const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }> = ({ checked, onChange, disabled }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? "bg-primary-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  // 환경변수 확인 (개발용)
  const checkFirebaseConfig = () => {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅" : "❌",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅" : "❌",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅" : "❌",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        ? "✅"
        : "❌",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
        ? "✅"
        : "❌",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✅" : "❌",
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? "✅" : "❌",
    };

    console.log("🔧 Firebase 설정 상태:", config);
    alert(`Firebase 설정 상태:\n${JSON.stringify(config, null, 2)}`);
  };

  // Service Worker 상태 확인
  const checkServiceWorkerStatus = async () => {
    if (!("serviceWorker" in navigator)) {
      alert("❌ Service Worker를 지원하지 않는 브라우저입니다.");
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const firebaseSW = registrations.find(
        (reg) =>
          reg.scope.includes("firebase") ||
          reg.active?.scriptURL.includes("firebase-messaging-sw.js")
      );

      const status = {
        "총 SW 개수": registrations.length,
        "Firebase SW": firebaseSW ? "✅ 등록됨" : "❌ 미등록",
        "Firebase SW URL": firebaseSW?.active?.scriptURL || "없음",
        "Firebase SW 상태": firebaseSW?.active?.state || "없음",
        "모든 SW": registrations.map((reg) => ({
          url: reg.active?.scriptURL,
          scope: reg.scope,
          state: reg.active?.state,
        })),
      };

      console.log("🔧 Service Worker 상태:", status);
      alert(`Service Worker 상태:\n${JSON.stringify(status, null, 2)}`);
    } catch (error) {
      console.error("Service Worker 상태 확인 실패:", error);
      alert(`Service Worker 상태 확인 실패: ${error}`);
    }
  };

  // 브라우저 알림 설정 상세 확인
  const checkNotificationDetails = () => {
    const details = {
      "Notification 지원": "Notification" in window ? "✅" : "❌",
      "권한 상태": Notification.permission,
      "사이트 설정": "브라우저 설정에서 확인 필요",
      "현재 URL": window.location.origin,
      HTTPS: window.location.protocol === "https:" ? "✅" : "❌",
      "User Agent": navigator.userAgent.slice(0, 50) + "...",
    };

    console.log("🔔 알림 상세 정보:", details);
    alert(
      `알림 상세 정보:\n${JSON.stringify(
        details,
        null,
        2
      )}\n\n⚠️ 브라우저 설정에서 ${
        window.location.origin
      } 사이트의 알림 허용 여부를 확인해주세요.`
    );
  };

  // 브라우저가 알림을 지원하지 않는 경우
  if (!isSupported) {
    return (
      <Card title="알림 설정">
        <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
          <div>
            <p className="font-medium text-yellow-800">
              알림 기능을 사용할 수 없습니다
            </p>
            <p className="text-sm text-yellow-700">
              현재 브라우저에서는 푸시 알림을 지원하지 않습니다.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 디버깅 정보 */}
      <Card title="🔍 디버깅 정보">
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">브라우저 지원:</span>
              <span className="ml-2 font-medium">
                {isSupported ? "✅ 지원됨" : "❌ 미지원"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">알림 권한:</span>
              <span className="ml-2 font-medium">
                {typeof Notification !== "undefined"
                  ? Notification.permission
                  : "확인 불가"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Service Worker:</span>
              <span className="ml-2 font-medium">
                {"serviceWorker" in navigator ? "✅ 지원됨" : "❌ 미지원"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">FCM 토큰:</span>
              <span className="ml-2 font-medium">
                {settings.fcmToken ? "✅ 있음" : "❌ 없음"}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200 flex flex-wrap gap-2">
            <Button
              onClick={checkFirebaseConfig}
              variant="outline"
              size="small"
            >
              Firebase 설정 확인
            </Button>
            <Button
              onClick={checkServiceWorkerStatus}
              variant="outline"
              size="small"
            >
              SW 상태 확인
            </Button>
            <Button
              onClick={checkNotificationDetails}
              variant="outline"
              size="small"
            >
              알림 상세 확인
            </Button>
          </div>
        </div>
      </Card>

      {/* 에러 표시 */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <p className="font-medium text-red-800">알림 설정 오류</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="small" onClick={clearError}>
            닫기
          </Button>
        </div>
      )}

      {/* 알림 권한 설정 */}
      <Card title="알림 권한 설정">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isEnabled ? (
                <Bell className="w-6 h-6 text-green-500" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">푸시 알림</h3>
                <p className="text-sm text-gray-600">
                  {hasPermission
                    ? "알림이 활성화되어 있습니다"
                    : "알림 권한을 허용해주세요"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasPermission && (
                <Button
                  variant="outline"
                  size="small"
                  onClick={sendTestNotification}
                  disabled={!isEnabled}
                >
                  <Play className="w-4 h-4 mr-1" />
                  테스트
                </Button>
              )}
              {hasPermission ? (
                <ToggleSwitch
                  checked={isEnabled}
                  onChange={(checked) =>
                    checked ? requestPermission() : requestPermission()
                  }
                />
              ) : (
                <Button
                  variant="primary"
                  size="small"
                  onClick={requestPermission}
                  disabled={isLoading}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  {isLoading ? "요청 중..." : "권한 허용"}
                </Button>
              )}
            </div>
          </div>

          {hasPermission && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Info className="w-4 h-4 text-blue-500 mr-2" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">
                    알림 권한이 허용되었습니다
                  </p>
                  <p className="text-blue-700">
                    FCM 토큰: {settings.fcmToken ? "등록됨" : "미등록"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {settings.permissionStatus === "denied" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <div className="text-sm">
                  <p className="text-red-800 font-medium">
                    알림 권한이 거부되었습니다
                  </p>
                  <p className="text-red-700">
                    브라우저 설정에서 수동으로 허용해주세요.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 알림 타입별 설정 */}
      {hasPermission && isEnabled && (
        <Card title="알림 타입 설정">
          <div className="space-y-4">
            {Object.entries(settings.types).map(([type, config]) => {
              const notificationType = type as NotificationType;
              const isExpanded = expandedType === notificationType;
              const hasTimeConfig = [
                "daily_summary",
                "weekly_summary",
                "monthly_summary",
                "expense_reminder",
              ].includes(notificationType);
              const hasThresholdConfig = [
                "budget_exceeded",
                "budget_warning",
              ].includes(notificationType);

              return (
                <div
                  key={notificationType}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {notificationTypeNames[notificationType]}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {notificationTypeDescriptions[notificationType]}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(hasTimeConfig || hasThresholdConfig) && (
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() =>
                            setExpandedType(
                              isExpanded ? null : notificationType
                            )
                          }
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      )}
                      <ToggleSwitch
                        checked={config.enabled}
                        // onChange={(enabled) =>
                        //   updateNotificationType(notificationType, { enabled })
                        // }
                        onChange={() => console.log(1)}
                      />
                    </div>
                  </div>

                  {/* 상세 설정 */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      {hasTimeConfig && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            알림 시간
                          </span>
                          <TimeInput
                            value={config.time || "09:00"}
                            // onChange={(time) =>
                            //   notificationType(notificationType, { time })
                            // }
                            onChange={() => console.log(1)}
                            disabled={!config.enabled}
                          />
                        </div>
                      )}

                      {hasThresholdConfig && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {notificationType === "budget_warning"
                              ? "경고 임계값"
                              : "초과 임계값"}
                          </span>
                          <PercentInput
                            value={config.threshold || 80}
                            // onChange={(threshold) =>
                            //   updateNotificationType(notificationType, {
                            //     threshold,
                            //   })
                            // }
                            onChange={() => console.log(1)}
                            disabled={!config.enabled}
                            min={1}
                            max={100}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 조용한 시간 설정 */}
      {hasPermission && isEnabled && (
        <Card title="조용한 시간 설정">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isQuietTime ? (
                  <Moon className="w-6 h-6 text-indigo-500" />
                ) : (
                  <Sun className="w-6 h-6 text-yellow-500" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">조용한 시간</h3>
                  <p className="text-sm text-gray-600">
                    설정한 시간 동안 알림을 받지 않습니다
                    {isQuietTime && " (현재 조용한 시간입니다)"}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.quietHours.enabled}
                onChange={() => console.log(1)}

                // onChange={(enabled) => updateQuietHours({ enabled })}
              />
            </div>

            {settings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작 시간
                  </label>
                  <TimeInput
                    value={settings.quietHours.startTime}
                    onChange={() => console.log(1)}

                    // onChange={(startTime) => updateQuietHours({ startTime })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료 시간
                  </label>
                  <TimeInput
                    value={settings.quietHours.endTime}
                    onChange={() => console.log(1)}

                    // onChange={(endTime) => updateQuietHours({ endTime })}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 알림 상태 정보 */}
      {hasPermission && isEnabled && (
        <Card title="알림 상태">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">알림 권한</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">
                  허용됨
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">현재 상태</span>
              <div className="flex items-center space-x-2">
                {isQuietTime ? (
                  <>
                    <VolumeX className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-indigo-600">
                      조용한 시간
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      활성화
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">활성화된 알림</span>
              <span className="text-sm font-medium text-gray-900">
                {
                  Object.values(settings.types).filter(
                    (config) => config.enabled
                  ).length
                }
                개
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationSettings;
