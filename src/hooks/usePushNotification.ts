import { useState, useEffect, useCallback } from "react";
import {
  getFCMToken,
  onForegroundMessage,
  // requestPermissionAndGetToken,
} from "@/lib/firebase";
import { INotificationSettings, NotificationType } from "@/types/budget";
/**
 * 기본 알림 설정
 */
const defaultNotificationSettings: INotificationSettings = {
  enabled: false,
  fcmToken: null,
  permissionStatus: "default",
  types: {
    budget_exceeded: {
      enabled: true,
      threshold: 90, // 예산 90% 초과시 알림
    },
    daily_summary: {
      enabled: false,
      time: "21:00", // 오후 9시
    },
    weekly_summary: {
      enabled: false,
      time: "09:00", // 오전 9시 (일요일)
    },
    monthly_summary: {
      enabled: true,
      time: "09:00", // 오전 9시 (매월 1일)
    },
    expense_reminder: {
      enabled: false,
      time: "20:00", // 오후 8시
    },
    budget_warning: {
      enabled: true,
      threshold: 80, // 예산 80% 도달시 경고
    },
  },
  quietHours: {
    enabled: false,
    startTime: "22:00", // 오후 10시
    endTime: "08:00", // 오전 8시
  },
};

/**
 * 푸시 알림 권한 및 설정을 관리하는 훅
 *
 * @returns 알림 관련 상태 및 함수들
 */
export const usePushNotification = () => {
  const [settings, setSettings] = useState<INotificationSettings>(
    defaultNotificationSettings
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 로컬 스토리지에서 설정 로드
   */
  const loadSettings = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem("notificationSettings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultNotificationSettings, ...parsed });
      }
    } catch (error) {
      console.error("알림 설정 로드 실패:", error);
      setError("알림 설정을 불러오는데 실패했습니다.");
    }
  }, []);

  useEffect(() => {
    console.log(">>🚀 usePushNotification 초기화");
    loadSettings();
    checkPermissionStatus();
  }, [loadSettings]);

  /**
   * 로컬 스토리지에 설정 저장
   */
  const saveSettings = useCallback((newSettings: INotificationSettings) => {
    try {
      localStorage.setItem("notificationSettings", JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("알림 설정 저장 실패:", error);
      setError("알림 설정을 저장하는데 실패했습니다.");
    }
  }, []);

  /**
   * 알림 권한 요청
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // 브라우저가 알림을 지원하는지 확인
      if (!("Notification" in window)) {
        throw new Error("이 브라우저는 알림을 지원하지 않습니다.");
      }

      // 이미 권한이 부여된 경우
      if (Notification.permission === "granted") {
        const token = await getFCMToken();
        const newSettings = {
          ...settings,
          enabled: true,
          permissionStatus: "granted" as NotificationPermission,
          fcmToken: token,
        };
        saveSettings(newSettings);
        return true;
      }

      // 권한이 거부된 경우
      if (Notification.permission === "denied") {
        throw new Error(
          "알림 권한이 거부되었습니다. 브라우저 설정에서 수동으로 허용해주세요."
        );
      }

      // 권한 요청
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const token = await getFCMToken();
        const newSettings = {
          ...settings,
          enabled: true,
          permissionStatus: permission,
          fcmToken: token,
        };
        saveSettings(newSettings);
        return true;
      } else {
        const newSettings = {
          ...settings,
          enabled: false,
          permissionStatus: permission,
          fcmToken: null,
        };
        saveSettings(newSettings);
        throw new Error("알림 권한이 거부되었습니다.");
      }
    } catch (error) {
      console.error("알림 권한 요청 실패:", error);
      setError(
        error instanceof Error
          ? error.message
          : "알림 권한 요청에 실패했습니다."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [settings, saveSettings]);

  /**
   * 알림 권한 상태 확인 (무한 렌더링 방지를 위해 설정 업데이트 제거)
   */
  const checkPermissionStatus = useCallback(() => {
    if ("Notification" in window) {
      setSettings((prevSettings) => ({
        ...prevSettings,
        permissionStatus: Notification.permission,
      }));
    }
  }, []);

  /**
   * 테스트 알림 전송
   */
  // const sendTestNotification = async () => {
  //   console.log(">>🎯 테스트 알림 시작");
  //   console.log(">>📊 현재 설정:", settings);
  //   console.log(">>🔐 알림 권한:", Notification.permission);
  //   console.log(">>✅ 알림 활성화:", settings.enabled);
  //   console.log(">>🔑 권한 상태:", settings.permissionStatus);
  //   if (!settings.enabled || settings.permissionStatus !== "granted") {
  //     setError(">>알림이 비활성화되어 있거나 권한이 없습니다.");
  //     return;
  //   }

  //   try {
  //     const notification = new Notification("가계부 알림 테스트", {
  //       body: "알림이 정상적으로 작동합니다! 🎉",
  //       icon: "/icons/icon-192x192.png",
  //       badge: "/icons/icon-72x72.png",
  //       tag: "test-notification",
  //     });

  //     // 3초 후 자동으로 닫기
  //     setTimeout(() => {
  //       notification.close();
  //     }, 3000);
  //   } catch (error) {
  //     console.error("테스트 알림 전송 실패:", error);
  //     setError("테스트 알림 전송에 실패했습니다.");
  //   }
  // };

  const [token, setToken] = useState<string | null>(null);

  // const sendTestNotification = async () => {
  //   const t = await requestPermissionAndGetToken();
  //   if (t) {
  //     setToken(t);
  //     alert("푸시 알림이 활성화되었습니다 ✅");
  //   }
  // };

  const sendTestNotification = async () => {
    if (!settings.fcmToken) {
      alert("먼저 구독 버튼을 눌러서 토큰을 발급받으세요");
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification("테스트 알림", {
        body: "이건 클라이언트에서 직접 보낸 테스트 알림입니다.",
        icon: "/icons/icon-192x192.png",
      });
    });

    // await fetch("/api/notification/send", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     token: settings.fcmToken,
    //     title: "새 메시지 도착!",
    //     message: "지금 바로 확인해보세요 🚀",
    //     url: "https://fizzchat.com/chat/123",
    //   }),
    // });
  };

  return {
    // 상태
    settings,
    isLoading,
    error,
    isQuietTime: settings.quietHours.enabled,

    // 액션
    requestPermission,
    sendTestNotification,
    checkPermissionStatus,
    clearError: () => setError(null),

    // 유틸리티
    isSupported: "Notification" in window && "serviceWorker" in navigator,
    hasPermission: settings.permissionStatus === "granted",
    isEnabled: settings.enabled,
  };
};

export default usePushNotification;
