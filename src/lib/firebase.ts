import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase 설정 유효성 검사
const isValidConfig = Object.values(firebaseConfig).every(
  (value) => value && value !== "undefined"
);

if (!isValidConfig) {
  console.warn(
    "⚠️ Firebase 환경변수가 설정되지 않았습니다. FCM 기능이 비활성화됩니다."
  );
}

// Firebase 앱 초기화
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// FCM 메시징 인스턴스
let messaging: any = null;

if (
  typeof window !== "undefined" &&
  typeof window.navigator !== "undefined" &&
  "serviceWorker" in navigator &&
  isValidConfig
) {
  messaging = getMessaging(app);
}

export { messaging };

// FCM 토큰 가져오기
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging || !isValidConfig) {
    console.warn(
      "⚠️ Firebase 설정이 완료되지 않아 FCM 토큰을 가져올 수 없습니다."
    );
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    console.log("🔑 FCM 토큰 생성됨:", token);
    return token;
  } catch (error) {
    console.error("❌ FCM 토큰 가져오기 실패:", error);
    return null;
  }
};

// 포그라운드 메시지 수신 처리
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.warn("⚠️ 메시징이 초기화되지 않았습니다.");
    return;
  }

  onMessage(messaging, (payload) => {
    console.log("포그라운드 메시지 수신:", payload);
    callback(payload);
  });
};

export default app;
