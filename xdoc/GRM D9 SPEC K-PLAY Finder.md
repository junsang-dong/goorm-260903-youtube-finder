## 추천 프로젝트: K-PLAY Finder

> 최근 개봉 영화·넷플릭스·드라마 관련 유튜브 영상을 수집하고, 사용자의 장르·콘텐츠 유형·영상 길이 취향에 따라 추천하는 서비스

Playboard가 국가·기간·조회수·성장률 등으로 유튜브 콘텐츠를 탐색하게 한다면, K-PLAY Finder는 여기에 **개인 취향과 추천 이유**를 추가하는 방식입니다. Playboard는 채널·영상·라이브·프로모션 데이터를 대상으로 다양한 랭킹과 분석 기능을 제공합니다. [Playboard](https://playboard.co/en/)

---

## 1. 해결하려는 문제

유튜브에서 작품명을 검색하면 다음 문제가 발생합니다.

* 공식 예고편, 리뷰, 요약, 인터뷰가 섞여 나온다.
* 조회수가 높은 오래된 영상이 최근 영상보다 먼저 보일 수 있다.
* 스포일러가 포함된 영상인지 판단하기 어렵다.
* 사용자의 장르와 영상 길이 취향이 충분히 반영되지 않는다.
* 단순 조회수만으로는 지금 반응이 좋은 콘텐츠인지 알기 어렵다.

따라서 서비스의 핵심 가치는 다음과 같습니다.

> “무엇을 볼지”와 “관련 영상 중 무엇을 먼저 볼지”를 함께 추천한다.

---

## 2. 사용자 입력

첫 방문 시 간단한 취향을 선택하게 합니다.

| 항목    | 선택 예시                 |
| ----- | --------------------- |
| 관심 분야 | 영화, 넷플릭스, 국내 드라마      |
| 선호 장르 | 액션, 스릴러, SF, 로맨스, 코미디 |
| 영상 유형 | 예고편, 리뷰, 해석, 인터뷰, 요약  |
| 영상 길이 | Shorts, 4~20분, 20분 이상 |
| 스포일러  | 허용, 최소화               |
| 최신성   | 오늘, 이번 주, 최근 30일      |
| 정렬 기준 | 인기, 급상승, 취향 일치        |

로그인 없이 `localStorage`에 취향을 저장하면 입문 과정에서도 쉽게 구현할 수 있습니다.

---

## 3. 핵심 화면

### ① 홈: 지금 인기 있는 K-콘텐츠

* 최근 인기 영상
* 영화 / 넷플릭스 / 드라마 탭
* 이번 주 급상승 영상
* 사용자를 위한 추천
* Shorts / 일반 영상 구분

### ② 취향 필터

* 장르
* 콘텐츠 플랫폼
* 영상 유형
* 업로드 기간
* 영상 길이
* 최소 조회수

### ③ 추천 카드

각 영상 카드에는 다음 정보를 표시합니다.

* 썸네일
* 영상 제목과 채널
* 조회수·좋아요·게시일
* 영상 길이
* 예고편·리뷰·인터뷰 등의 유형
* 인기 점수
* 취향 일치도
* 추천 이유

예:

> “최근 7일 내 등록된 SF 영화 리뷰이며, 10분 내외 해설 영상을 선호하는 취향과 일치합니다.”

### ④ 작품 상세 페이지

하나의 작품을 기준으로 영상을 묶어 보여줍니다.

```text
작품명
├─ 공식 예고편
├─ 스포일러 없는 리뷰
├─ 심층 해석
├─ 배우 인터뷰
└─ Shorts
```

이 화면이 일반적인 유튜브 검색 서비스와 가장 크게 차별화되는 부분입니다.

---

## 4. YouTube Data API 활용 방법

### 영상 검색

`search.list`를 이용합니다.

```http
GET https://www.googleapis.com/youtube/v3/search
  ?part=snippet
  &q=작품명 리뷰
  &type=video
  &regionCode=KR
  &relevanceLanguage=ko
  &publishedAfter=2026-08-01T00:00:00Z
  &order=date
  &maxResults=20
  &videoEmbeddable=true
```

지원하는 주요 검색 조건에는 게시일, 카테고리, 영상 길이, 자막, 임베드 가능 여부 등이 있습니다. [YouTube `search.list` 문서](https://developers.google.com/youtube/v3/docs/search/list)

### 상세 통계 조회

검색 결과의 video ID를 모아서 `videos.list`를 한 번 호출합니다.

```http
GET https://www.googleapis.com/youtube/v3/videos
  ?part=snippet,statistics,contentDetails,status
  &id=VIDEO_ID_1,VIDEO_ID_2,VIDEO_ID_3
```

여기서 다음 정보를 얻습니다.

* `viewCount`
* `likeCount`
* `commentCount`
* `duration`
* `tags`
* `categoryId`
* 임베드 가능 여부

`videos.list`는 `chart=mostPopular`과 `regionCode=KR` 조합으로 한국 인기 동영상도 가져올 수 있습니다. [YouTube `videos.list` 문서](https://developers.google.com/youtube/v3/docs/videos/list)

---

## 5. 추천 점수 설계

첫 MVP에서는 AI 모델보다 설명 가능한 점수식을 권합니다.

```text
추천점수 =
  취향일치도 × 0.35
+ 최신성점수 × 0.25
+ 조회수속도 × 0.20
+ 참여도 × 0.15
+ 채널신뢰도 × 0.05
```

### 주요 지표

```text
조회수 속도 = 조회수 ÷ 업로드 후 경과 일수

참여도 = (좋아요 수 + 댓글 수 × 2) ÷ 조회수

최신성 = 1 ÷ (업로드 후 경과 일수 + 1)
```

조회수가 지나치게 큰 영상의 독점을 막기 위해 로그 변환을 적용할 수 있습니다.

```typescript
const velocityScore =
  Math.log10(viewCount / Math.max(ageInDays, 1) + 1);

const engagementRate =
  (likeCount + commentCount * 2) / Math.max(viewCount, 1);

const recommendationScore =
  preferenceScore * 0.35 +
  freshnessScore * 0.25 +
  velocityScore * 0.20 +
  engagementRate * 0.15 +
  channelTrustScore * 0.05;
```

“급상승”은 YouTube가 직접 제공하는 완전한 추세값이 아니라, **현재 조회수와 게시 후 경과 시간을 이용해 서비스가 계산한 추정치**라고 UI에 표시해야 합니다.

---

## 6. 콘텐츠 분류 규칙

초기에는 제목·설명·채널명 키워드로 충분합니다.

| 유형      | 분류 키워드                   |
| ------- | ------------------------ |
| 공식 예고편  | 공식, 예고편, trailer, teaser |
| 리뷰      | 리뷰, 후기, review           |
| 해석      | 해석, 분석, 결말, 떡밥           |
| 요약      | 요약, 몰아보기, 몇 분 만에         |
| 인터뷰     | 인터뷰, 제작기, 비하인드           |
| 스포일러 위험 | 결말, 엔딩, 범인, 반전, 스포       |

이후 V2에서 LLM을 연결해 다음과 같이 구조화할 수 있습니다.

```json
{
  "contentType": "review",
  "genres": ["SF", "thriller"],
  "spoilerRisk": "medium",
  "sentiment": "positive",
  "summary": "신작의 세계관과 연출을 분석한 리뷰",
  "targetAudience": "작품 관람을 고민하는 시청자"
}
```

---

## 7. 추천 기술 스택

학습자가 React/Vite를 경험했다면 다음 구성이 현실적입니다.

```text
React + Vite + TypeScript
        ↓
Vercel Serverless Function
        ↓
YouTube Data API v3
        ↓
정규화·분류·추천 점수 계산
        ↓
영상 카드 및 작품별 컬렉션
```

* 프런트엔드: React, Vite, TypeScript
* 스타일: Tailwind CSS 또는 기본 CSS
* 상태관리: React Context
* 사용자 취향: localStorage
* API: Vercel Functions
* 캐시: 초기에는 JSON 또는 메모리 캐시
* 배포: GitHub + Vercel

YouTube API Key는 브라우저 코드에 넣지 않고 서버리스 API에서만 사용해야 합니다.

---

## 8. 중요한 데이터 설계

```typescript
interface RecommendedVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;

  viewCount: number;
  likeCount: number;
  commentCount: number;
  durationSeconds: number;

  topic: "movie" | "netflix" | "drama";
  contentType: "trailer" | "review" | "analysis" | "interview";
  spoilerRisk: "low" | "medium" | "high";

  popularityScore: number;
  preferenceScore: number;
  recommendationScore: number;
  recommendationReason: string;
}
```

---

## 9. 최근 개봉작 데이터는 별도로 준비

YouTube Data API는 “한국의 최근 개봉 영화 목록”이나 “현재 넷플릭스 신작 목록”을 직접 제공하지 않습니다. 따라서 MVP에서는 다음 중 하나를 선택해야 합니다.

1. **수동 키워드 시드 방식 — 수업용 추천**

```json
[
  {
    "title": "작품명",
    "type": "movie",
    "genres": ["action", "thriller"],
    "keywords": ["작품명 예고편", "작품명 리뷰"]
  }
]
```

2. V2에서 외부 API 연결

* 영화: KOBIS 영화관입장권통합전산망 API
* 글로벌 영화·TV 메타데이터: TMDB API
* 넷플릭스: 공식 공개 콘텐츠 또는 별도 제공 데이터 검토

9일차 수업에서는 작품 10~20개를 JSON으로 준비하는 편이 API 연결과 추천 로직 학습에 집중하기 좋습니다.

---

## 10. 수업용 구현 순서

### 1단계: End-to-End 성공

* API Key 발급
* 검색어 입력
* YouTube 영상 가져오기
* 영상 카드 출력
* YouTube 링크 연결

### 2단계: 콘텐츠 리스팅

* 영화·넷플릭스·드라마 탭
* 최신순·조회수순 정렬
* 영상 길이 필터
* 페이지네이션

### 3단계: 취향 추천

* 사용자 취향 선택
* 추천 점수 계산
* “추천 이유” 표시
* localStorage 저장

### 4단계: 품질과 배포

* 로딩·빈 결과·API 오류 처리
* API Key 서버사이드 보호
* 모바일 반응형 UI
* Vercel 배포

---

## 11. API 쿼터 운영 주의점

현재 공식 문서 기준으로 `search.list`는 별도의 기본 일일 호출 한도가 적용되고, 여러 페이지를 요청하면 각 페이지가 추가 호출로 계산됩니다. 반면 `videos.list`는 비교적 저비용으로 여러 video ID의 통계를 한꺼번에 조회할 수 있습니다. [YouTube API 쿼터 계산 문서](https://developers.google.com/youtube/v3/determine_quota_cost)

따라서 다음 구조가 좋습니다.

```text
작품별 검색 결과를 주기적으로 수집
→ video ID 저장
→ videos.list로 상세 통계 일괄 조회
→ 서버 캐시
→ 여러 사용자가 캐시 결과 공유
```

사용자가 필터를 바꿀 때마다 YouTube API를 다시 호출하기보다, 이미 수집한 결과를 브라우저에서 필터링하도록 설계하면 쿼터를 크게 절약할 수 있습니다.

## 최종 MVP 범위

> **작품 12개 × 작품당 영상 10개를 수집하고, 사용자가 선택한 장르·영상 유형·길이를 기준으로 상위 20개 영상을 추천하는 모바일 우선 웹앱**

핵심 학습 포인트는 네 가지입니다.

* 외부 API 호출과 데이터 정규화
* 검색 결과와 상세 통계 API 결합
* 설명 가능한 추천 알고리즘
* API Key 보호 및 클라우드 배포

이 정도 범위라면 단순한 영상 검색 예제를 넘어, **데이터 수집 → 분석 → 개인화 → 추천 → 배포**가 연결된 훌륭한 9일차 AI 어시스턴트 프로젝트가 됩니다.
