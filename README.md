# 공용 가계부 웹앱

부부가 함께 사용할 수 있는 공용 가계부 웹 애플리케이션입니다.

## 🚀 주요 기능

### 1. 거래 입력 (InputPage)

- 입금/지출 구분 입력
- 거래 내용, 날짜, 금액 입력
- 결제수단 선택 (성욱현금, 회진현금, 회진카카오체크 등)
- 카테고리 분류 (식비, 운동, 용돈 등)
- 입력 즉시 엑셀 시트에 반영

### 2. 거래 내역 조회 (ViewPage)

- 달력으로 일별 총입금, 총지출 확인
- 입금/지출 내역 상세 조회
- 사용자별 지출내역 (성욱/회진 전환)
- 카테고리별 지출 현황 (파이차트 시각화)
- 월별 총지출 내역 확인
- 월별 카테고리별 지출 내역 확인

### 3. 지출 분석 (AnalysisPage)

- 평소보다 많이 쓴 카테고리 분석
- 다음 달 지출 절감 방법 추천
- 계획 예산 대비 초과 지출 금액 표시
- 사용자별 지출 패턴 분석

### 4. 설정 관리 (AdminPage)

- 결제수단 추가/삭제
- 카테고리 추가/삭제
- 이번 달 계획 금액 입력
- 카테고리별 예산 설정

### 5. PWA 및 푸시 알림

- **PWA 기능**: 앱처럼 설치 가능, 오프라인 지원
- **푸시 알림**: 예산 초과, 지출 경고, 월별 요약 등
- **알림 설정**: 사용자별 알림 타입 및 시간 설정
- **FCM 연동**: Firebase Cloud Messaging을 통한 실시간 알림

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Build Tool**: Next.js App Router
- **PWA**: next-pwa
- **Push Notifications**: Firebase Cloud Messaging (FCM)

## 📱 반응형 디자인

- **PC**: 1024px 이상
- **패드**: 480px ~ 1024px
- **모바일**: 480px 미만 (모바일 퍼스트)

## 🎨 디자인 컨셉

- **분위기**: 심플하고 깔끔한 느낌
- **컬러 팔레트**:
  - Primary: 크림/베이지 계열 (#FEF7ED, #F3E8FF)
  - Secondary: 투명한 화이트/블랙 계열 (#FFF, #000)
- **폰트**: 한글과 숫자 가독성 좋은 Inter 폰트
- **여백**: 충분한 패딩으로 편안한 느낌

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 3. 빌드

```bash
npm run build
```

### 4. 프로덕션 실행

```bash
npm start
```

## 📱 PWA 설치 및 사용법

### 모바일에서 설치하기

1. **Chrome/Edge (Android)**:

   - 브라우저에서 앱 접속
   - 주소창 옆의 "설치" 아이콘 클릭
   - "설치" 버튼 확인

2. **Safari (iOS)**:

   - Safari에서 앱 접속
   - 하단 공유 버튼 탭
   - "홈 화면에 추가" 선택

3. **데스크톱 (Chrome/Edge)**:
   - 브라우저에서 앱 접속
   - 주소창 오른쪽의 설치 아이콘 클릭
   - "설치" 버튼 확인

### 푸시 알림 설정

1. 앱 첫 실행 시 알림 권한 요청 모달이 표시됩니다
2. "알림 권한 허용하기" 버튼을 클릭하여 권한을 허용하세요
3. 홈 화면의 "알림 설정" 버튼을 통해 세부 알림 설정을 관리할 수 있습니다

### 알림 타입

- **예산 알림**: 예산의 20% 이하가 남았을 때
- **지출 경고**: 큰 금액 지출 시
- **월별 요약**: 매월 가계부 요약
- **카테고리 초과**: 카테고리 예산 초과 시
- **거래 추가**: 새 거래 추가 시 (선택사항)

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── input/             # 거래 입력 페이지
│   ├── view/              # 거래 내역 조회 페이지
│   ├── analysis/          # 지출 분석 페이지
│   ├── admin/             # 설정 관리 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈 페이지
│   └── globals.css        # 전역 스타일
├── components/            # React 컴포넌트
│   ├── common/           # 공통 컴포넌트
│   │   ├── Layout.tsx    # 레이아웃 컴포넌트
│   │   ├── Navigation.tsx # 네비게이션 컴포넌트
│   │   └── NotificationPermission.tsx # 알림 권한 컴포넌트
│   ├── sections/         # 페이지별 섹션 컴포넌트
│   └── ui/               # UI 컴포넌트
│       ├── Button.tsx    # 버튼 컴포넌트
│       ├── Input.tsx     # 입력 컴포넌트
│       ├── Select.tsx    # 셀렉트 컴포넌트
│       └── Card.tsx      # 카드 컴포넌트
├── lib/                  # 유틸리티 함수
│   ├── utils.ts          # 공통 유틸 함수
│   ├── excel.ts          # 엑셀 연동 유틸
│   ├── firebase.ts       # Firebase 설정
│   └── notificationService.ts # 알림 서비스
├── hooks/                # 커스텀 훅
│   └── usePushNotification.ts # 푸시 알림 훅
├── store/                # 상태 관리
│   └── useBudgetStore.ts # Zustand 스토어
├── types/                # TypeScript 타입 정의
│   └── budget.ts         # 가계부 관련 타입
└── styles/               # 스타일 파일
```

## 🔧 주요 설정

### Tailwind CSS

- 모바일 퍼스트 반응형 디자인
- 커스텀 컬러 팔레트 설정
- 접근성 및 성능 최적화

### TypeScript

- 엄격한 타입 정의
- 인터페이스 기반 개발
- 타입 안전성 보장

### Zustand

- 가벼운 상태 관리
- 로컬 스토리지 연동
- 타입 안전한 스토어

### PWA (Progressive Web App)

- next-pwa를 통한 PWA 기능 구현
- 오프라인 지원 및 캐싱 전략
- 앱 설치 가능 (Add to Home Screen)
- 서비스 워커를 통한 백그라운드 동기화

### Firebase Cloud Messaging (FCM)

- 실시간 푸시 알림 지원
- 예산 초과, 지출 경고 등 스마트 알림
- 사용자별 알림 설정 관리
- 포그라운드/백그라운드 알림 처리

## 📊 데이터 구조

### 거래 내역 (Transaction)

```typescript
interface ITransactionView {
  id: string;
  type: "income" | "expense";
  description: string;
  date: Date;
  amount: number;
  card: string;
  category: string;
  owner: "성욱" | "회진";
}
```

### 관리 설정 (AdminConfig)

```typescript
interface IAdminConfig {
  cards: string[];
  categories: string[];
  monthlyBudget: number;
  categoryBudgets: Record<string, number>;
}
```

## 🎯 향후 계획

- [ ] Google Sheets API 연동
- [ ] 차트 라이브러리 추가 (Recharts)
- [x] PWA 기능 추가
- [ ] 데이터 내보내기/가져오기
- [ ] 알림 기능 (FCM)
- [ ] 다크 모드 지원
- [ ] 오프라인 데이터 동기화
- [ ] 백그라운드 동기화

## 📝 라이선스

ISC License

## 👥 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

💕 부부가 함께하는 가계 관리, 공용 가계부로 시작해보세요!
