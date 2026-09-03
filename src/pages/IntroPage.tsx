import { Link } from 'react-router-dom'

const stats = [
  {
    value: '12',
    label: '작품 시드',
    sub: '영화 · 넷플릭스 · 드라마',
    accent: true,
  },
  {
    value: '120+',
    label: '수집 영상',
    sub: '작품당 약 10개',
    accent: false,
  },
  {
    value: '20',
    label: '맞춤 추천',
    sub: '취향 기반 상위 노출',
    accent: false,
  },
  {
    value: '3·6·12',
    label: '최신성 가중',
    sub: '개월 단위 freshness boost',
    accent: true,
  },
]

export function IntroPage() {
  return (
    <div className="intro-page min-h-screen bg-black font-ko text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/intro" className="font-display text-2xl tracking-wide text-white">
          K-PLAY Finder
        </Link>
        <Link
          to="/app"
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium transition hover:bg-white hover:text-black"
        >
          앱 바로가기
        </Link>
      </header>

      {/* Our Solution */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-4">
        <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
          Our Solution
        </h1>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[28px] bg-[#b8d9ef] p-8 text-black sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <p className="max-w-md text-3xl font-bold leading-tight sm:text-4xl">
                무엇을 볼지,
                <br />
                무엇을 먼저 볼지 함께 추천합니다.
              </p>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-xl text-white">
                ▶
              </span>
            </div>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-black/80">
              유튜브에서 작품명을 검색하면 예고편, 리뷰, 요약, 스포일러 영상이
              섞여 나옵니다. K-PLAY Finder는 최근 K-콘텐츠 관련 영상을
              수집·분류하고, 장르·유형·길이 취향에 맞춰 설명 가능한 점수로
              추천합니다.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[28px] bg-[#b8d9ef] p-8 text-black">
              <p className="text-4xl font-bold">35%</p>
              <p className="mt-2 text-lg font-semibold">취향 일치 가중</p>
              <p className="mt-1 text-sm text-black/70">
                추천 점수의 핵심 요소로 반영
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-[#111] p-8">
              <p className="text-4xl font-bold">3×</p>
              <p className="mt-2 text-lg font-semibold text-white/90">
                빠른 탐색
              </p>
              <p className="mt-1 text-sm text-white/60">
                작품별로 예고편·리뷰·해석·Shorts를 한 화면에
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Highlights */}
      <section className="bg-white py-20 text-black">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Our Highlights
            </h2>
            <span className="mt-6 inline-block rounded-full border border-black px-4 py-1 text-sm font-semibold">
              2026
            </span>
            <p className="mt-6 max-w-md text-base leading-relaxed text-black/75">
              goorm 9일차 MVP로 데이터 수집부터 개인화 추천, 배포까지 연결된
              K-PLAY Finder. YouTube API 쿼터를 고려한 캐시·필터 구조와
              Rising·Popular 중복 제거, 3·6·12개월 최신성 가중치까지
              반영했습니다.
            </p>
          </div>

          <div className="rounded-[32px] bg-black p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((item) => (
                <article
                  key={item.label}
                  className={`rounded-[24px] p-6 ${
                    item.accent
                      ? 'bg-[#b8d9ef] text-black'
                      : 'bg-[#1a1a1a] text-white'
                  }`}
                >
                  <p className="text-3xl font-bold sm:text-4xl">{item.value}</p>
                  <p className="mt-2 text-base font-semibold">{item.label}</p>
                  <p
                    className={`mt-1 text-sm ${
                      item.accent ? 'text-black/70' : 'text-white/60'
                    }`}
                  >
                    {item.sub}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="bg-white pb-20 pt-4">
        <div className="mx-auto max-w-6xl px-6">
          <div className="overflow-hidden rounded-[32px] border border-black/10 bg-[#f5f5f5]">
            <img
              src="/docs/k-play-finder-preview.jpg"
              alt="K-PLAY Finder Rising·Popular 화면"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Let's talk / CTA */}
      <section className="relative overflow-hidden bg-black pb-16 pt-20">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.95)), url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <h2 className="text-4xl font-bold sm:text-5xl">Let&apos;s explore.</h2>
          <p className="mt-4 max-w-xl text-white/70">
            취향을 선택하고 For You, Rising, Popular 추천을 바로 확인해 보세요.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <CtaCard label="Try App" value="앱 시작하기" href="/app" internal />
            <CtaCard
              label="GitHub"
              value="goorm-260903-youtube-finder"
              href="https://github.com/junsang-dong/goorm-260903-youtube-finder"
            />
            <CtaCard label="Stack" value="React · Vite · YouTube API" href="/app" internal />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-6 py-8 text-center text-sm text-white/50">
        K-PLAY Finder — 영화·넷플릭스·드라마 유튜브 추천 MVP
      </footer>
    </div>
  )
}

function CtaCard({
  label,
  value,
  href,
  internal = false,
}: {
  label: string
  value: string
  href: string
  internal?: boolean
}) {
  const className =
    'group block overflow-hidden rounded-[24px] border border-white/10 transition hover:border-[#b8d9ef]/60'

  const inner = (
    <>
      <div className="bg-[#b8d9ef] px-5 py-3 text-sm font-semibold text-black">
        {label}
      </div>
      <div className="bg-[#111] px-5 py-4 text-sm text-white/90 group-hover:text-white">
        {value}
      </div>
    </>
  )

  if (internal) {
    return (
      <Link to={href} className={className}>
        {inner}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {inner}
    </a>
  )
}
