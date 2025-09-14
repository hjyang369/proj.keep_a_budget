// Firebase SDKs를 import
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// Firebase 설정 - 실제 값으로 교체 필요
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// FCM 메시징 인스턴스
const messaging = firebase.messaging();

// 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage((payload) => {
  console.log("백그라운드 메시지 수신:", payload);

  const notificationTitle = payload.notification?.title || "가계부 알림";
  const notificationOptions = {
    body: payload.notification?.body || "새로운 알림이 있습니다.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: "budget-notification",
    requireInteraction: true,
    actions: [
      {
        action: "open",
        title: "앱 열기",
        icon: "/icons/icon-72x72.png",
      },
      {
        action: "close",
        title: "닫기",
      },
    ],
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 처리
self.addEventListener("notificationclick", (event) => {
  console.log("알림 클릭:", event);

  event.notification.close();

  if (event.action === "open" || !event.action) {
    // 앱 열기
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // 이미 열린 창이 있으면 포커스
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        // 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
    );
  } else if (event.action === "close") {
    // 알림 닫기 (이미 위에서 close() 호출됨)
    console.log("알림 닫기");
  }
});

// 알림 닫기 처리
self.addEventListener("notificationclose", (event) => {
  console.log("알림 닫힘:", event);
});
