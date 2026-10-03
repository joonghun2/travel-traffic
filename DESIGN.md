# Check East Point (체크이스트포인트) - Design System & UI Guide

## 1. 개요 및 디자인 철학 (Design Philosophy)
- **핵심 목표**: "팬시하고 단순하며 직관적인" 서울 실시간 혼잡도 안내 UI.
- **레퍼런스 모델**:
  - **Google 메인**: 넓은 여백과 강력한 중앙 검색창 중심의 간결함.
  - **헤이딜러 앱**: 거대한 숫자 타이포그래피 위계, 단일 브랜드 포인트 컬러, 깔끔한 4-tier 상태 인디케이터.
- **경험 원칙**: 사용자가 카드를 1초만 보아도 현재 혼잡 여부와 대기 시간을 직관적으로 파악할 수 있어야 함.

---

## 2. 브랜드 정체성 (Brand Identity)
- **서비스명**: Check East Point (체크이스트포인트)
- **슬로건**: 서울 주요 관광지 실시간 혼잡도 & 스마트 길찾기 가이드
- **심볼 로고**: 굵은 모던 라운드 C 로고마크 + LIVE 펄스 인디케이터

---

## 3. 컬러 시스템 (Color Palette)

### 3-1. 브랜드 포인트 컬러 (Primary)
- **Primary Blue**: `#2563eb` (Tailwind `blue-600`) / Dark: `#3b82f6` (`blue-500`)
- **Accent**: `#1d4ed8` (Hover), `#1e40af` (Active)

### 3-2. 중립색 (Neutral & Surface)
- **Light Theme**:
  - Background: `#f8fafc` (`slate-50`)
  - Card/Surface: `#ffffff` (`white`)
  - Border: `#e2e8f0` (`slate-200`)
  - Text Primary: `#0f172a` (`slate-900`)
  - Text Secondary: `#475569` (`slate-600`)
  - Text Muted: `#64748b` (`slate-500`)
- **Dark Theme**:
  - Background: `#020617` (`slate-950`)
  - Card/Surface: `#0f172a` (`slate-900`)
  - Border: `#1e293b` (`slate-800`)
  - Text Primary: `#f8fafc` (`slate-50`)
  - Text Secondary: `#cbd5e1` (`slate-300`)
  - Text Muted: `#94a3b8` (`slate-400`)

### 3-3. 혼잡도 4단계 시맨틱 컬러 (Congestion Semantic Tiers)
| 등급 (Tier) | 지수 구간 (Score) | 컬러명 | HEX (Light / Dark) | 뱃지 배경 (Light / Dark) | 의미 및 대기 기준 |
|---|---|---|---|---|---|
| **여유 (Relaxed)** | 0 ~ 39 | Emerald Green | `#059669` / `#34d399` | `#ecfdf5` / `#064e3b` | 대기 없음 (< 5분), 쾌적 |
| **보통 (Moderate)** | 40 ~ 69 | Amber Yellow | `#d97706` / `#fbbf24` | `#fffbeb` / `#78350f` | 원활한 관람 (5~20분) |
| **혼잡 (Crowded)** | 70 ~ 84 | Orange | `#ea580c` / `#fb923c` | `#fff7ed` / `#7c2d12` | 대기 발생 (20~40분) |
| **매우 혼잡 (Very Crowded)**| 85 ~ 100 | Crimson Red | `#dc2626` / `#f87171` | `#fef2f2` / `#7f1d1d` | 입장 지연 (40분 이상) |

*모든 텍스트 및 뱃지는 WCAG AA 4.5:1 이상의 대비율을 유지함.*

---

## 4. 타이포그래피 (Typography Hierarchy)
- **기본 폰트**: Pretendard / Geist Sans Fallback
- **숫자 폰트**: `font-mono` 또는 `tabular-nums` 적용 (실시간 지수, 거리, 시간의 고정폭 정렬)
- **위계 구조**:
  - **Display (숫자 최대)**: `text-3xl` ~ `text-4xl` (`32px` ~ `36px`), `font-black` (카드 혼잡 지수 전용)
  - **Title (명소명/헤더)**: `text-lg` ~ `text-xl` (`18px` ~ `20px`), `font-bold`
  - **Body (보조 정보)**: `text-sm` (`14px`), `font-medium`
  - **Caption (메타데이터/단위)**: `text-xs` ~ `text-[11px]` (`11px` ~ `12px`), `font-normal`

---

## 5. 컴포넌트 구조 및 레이아웃 가이드 (Components)

### 5-1. 홈 상단 (Hero & Search)
- **Google 스타일**: 상단 배너 복잡도를 제거하고 **중앙 대형 검색창(Pill shape)**을 중심으로 배치.
- **원클릭 권역 칩**: 가로 스크롤 가능한 단일 라인 칩 (전체, 도심, 서북, 동북, 동남, 서남).
- **실시간 여유 핫스팟 바**: 지금 쾌적한 4곳을 즉시 선택 가능한 컴팩트 스트립.

### 5-2. 핫스팟 카드 (Spot Card)
- **1행**: 명소명(굵게) + 권역/지역구(작게)
- **2행 (핵심)**: **초대형 혼잡 지수 숫자 (`88`)** + `/100` + 상태 뱃지 1개 + 예상 대기 시간
- **3행**: 추천 방문 시간대 ("추천: 평일 오전 10:30")
- **4행**: 단일 [길찾기] 버튼 (클릭 시 카카오/네이버/구글 맵 선택 바텀시트 연동)

### 5-3. 바텀시트 및 팝업 (Action Sheets)
- **길찾기 선택 시트**: 카카오맵 / 네이버지도 / 구글지도 원클릭 연결.
- **명소 상세 시트**: 현지인 꿀팁 전문, 최적 시간대 그래프, 긴급 우회 히든 스팟.

### 5-4. 하단 고정 탭바 (Bottom Nav)
- **구조**: `혼잡도` (홈) / `놀이` (심리테스트) / `내 주변` (가까운 순 정렬)
- **스타일**: 모던 글래스모피즘 (`backdrop-blur-md`), 활성 탭은 브랜드 Primary Blue.

---

## 6. 접근성 & 성능 제약 조건 (Hard Constraints)
- **접근성 (WCAG 2.1 AA)**:
  - 텍스트 명도 대비 4.5:1 이상 필수
  - 터치 타깃 최소 44px x 44px 보장
  - 헤딩 아웃라인 (`h1` → `h2`) 계층 건너뜀 금지
  - 모든 내비게이션 및 지도 링크는 명소명을 포함한 명확한 `aria-label` 제공
- **성능 (LCP & DOM)**:
  - 초기 DOM 노드 수 < 600개 유지 (점진적 18개 카드 렌더링 유지)
  - 서드파티 스크립트 (GTM, Kakao)는 `lazyOnload` / `IntersectionObserver` 지연 유지
  - 모션은 `transform` 및 `opacity`만 사용하여 리플로우 방지
  - `prefers-reduced-motion` 미디어 쿼리 시 모든 애니메이션 비활성화
