import { GuestForm } from '../components/form/GuestForm'
import { Hero } from '../components/layout/Hero'
import { SiteFooter } from '../components/layout/SiteFooter'
import { Toast } from '../components/layout/Toast'
import { GoogleMark } from '../components/icons/GoogleMark'
import { SectionHeading } from '../components/ui/SectionHeading'
import { formatRankPlace } from '../lib/circlePair'
import { shouldKeepCircleForm } from '../lib/circleForm'
import { useRankPage } from '../hooks/useRankPage'

const TABS = [
  { id: 'lineup', label: '궁합 순위' },
  { id: 'love', label: '연애' },
  { id: 'wealth', label: '재물' },
]

function LockedRows() {
  return (
    <ol className="rank-list is-locked" aria-hidden="true">
      <li>숨긴 자리 · 로그인하면 보입니다</li>
      <li>숨긴 자리 · 로그인하면 보입니다</li>
      <li>숨긴 자리 · 로그인하면 보입니다</li>
    </ol>
  )
}

export function RankPage({ hostId }) {
  const page = useRankPage(hostId)

  return (
    <div className="page">
      <Hero compact />
      <main className="shell rank-shell">
        {page.loadingHost && (
          <p className="sidebar-empty">순위를 펼치는 중</p>
        )}

        {!page.loadingHost && page.missing && (
          <section className="section">
            <p className="form-error" role="alert">
              순위를 찾지 못했습니다. 링크가 잘못되었거나 아직 프로필이 없습니다.
            </p>
            <p>
              <a className="auth-button is-primary" href="/">
                메인으로
              </a>
            </p>
          </section>
        )}

        {!page.loadingHost && page.host && (
          <section className="section" aria-labelledby="rank-title">
            <SectionHeading
              kicker="궁합"
              title={`${page.host.name}님의 궁합 순위`}
              titleId="rank-title"
            />
            <p className="rank-lead">
              이름과 생년월일을 직접 넣어도 되고, 링크를 보내 상대가 보게 해도
              됩니다. 전체 순위는 로그인한 뒤에 열립니다.
            </p>

            <div className="rank-tabs" role="tablist" aria-label="궁합 순위와 시너지">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={page.tab === item.id}
                  className={
                    page.tab === item.id
                      ? 'topic-seg-item is-active'
                      : 'topic-seg-item'
                  }
                  onClick={() => page.setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {page.tab === 'lineup' && (
              <div className="rank-panel">
                {page.isHost && (
                  <div className="form-block">
                    <p className="form-block-title">친구 초대</p>
                    <p className="rank-lead">
                      직접 넣거나, 이 링크를 보내 상대가 순위를 보게 할 수 있습니다.
                    </p>
                    <button
                      type="button"
                      className="auth-button is-primary"
                      onClick={page.handleShareInvite}
                    >
                      초대 링크 복사
                    </button>
                  </div>
                )}

                {shouldKeepCircleForm({
                  isHost: page.isHost,
                  hasMine: Boolean(page.mine),
                }) && (
                    <GuestForm
                      name={page.name}
                      onNameChange={(e) => page.setName(e.target.value)}
                      yearRef={page.yearRef}
                      monthRef={page.monthRef}
                      dayRef={page.dayRef}
                      year={page.year}
                      month={page.month}
                      day={page.day}
                      onYearChange={page.handleYearChange}
                      onMonthChange={page.handleMonthChange}
                      onDayChange={page.handleDayChange}
                      onBirthKeyDown={page.handleBirthKeyDown}
                      time={page.time}
                      onTimeChange={page.setTime}
                      gender={page.gender}
                      onGenderChange={(e) => page.setGender(e.target.value)}
                      calendar={page.calendar}
                      onCalendarChange={(e) => page.setCalendar(e.target.value)}
                      error={page.error}
                      loading={page.saving}
                      onSubmit={page.handleSubmit}
                      submitLabel={page.isHost ? '순위에 넣기' : '순위 보기'}
                    />
                  )}

                {page.mine && (
                  <article className="rank-mine">
                    <p className="section-kicker">Your place</p>
                    <h3 className="rank-epithet">{page.mine.epithet}</h3>
                    <p className="rank-line">{page.mine.line}</p>
                  </article>
                )}

                {page.canSeeRanks ? (
                  page.ranked.length ? (
                    <ol className="rank-list">
                      {page.ranked.map((row) => (
                        <li key={row.id ?? row.name}>
                          <button
                            type="button"
                            className={
                              page.selected?.id === row.id
                                ? 'rank-item is-active'
                                : 'rank-item'
                            }
                            onClick={() => page.setSelectedId(row.id)}
                          >
                            <span className="rank-place">
                              {formatRankPlace(row.place, row.tied)}
                            </span>
                            <span>
                              <strong>{row.epithet}</strong>
                              <em>{row.name}</em>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="sidebar-empty">아직 순위에 오른 사람이 없습니다.</p>
                  )
                ) : (
                  <>
                    <LockedRows />
                    <button
                      type="button"
                      className="submit result-lock-button"
                      onClick={page.handleGoogleLogin}
                    >
                      <GoogleMark />
                      로그인하고 전체 순위 보기
                    </button>
                  </>
                )}
              </div>
            )}

            {page.tab !== 'lineup' && (
              <div className="rank-panel">
                {page.selected ? (
                  <article className="rank-mine">
                    <p className="section-kicker">
                      {page.tab === 'love' ? '연애 시너지' : '재물 시너지'}
                    </p>
                    <h3 className="rank-epithet">
                      {page.tab === 'love'
                        ? page.selected.love_title
                        : page.selected.wealth_title}
                    </h3>
                    <p className="rank-line">
                      {page.tab === 'love'
                        ? page.selected.love_line
                        : page.selected.wealth_line}
                    </p>
                    <p className="rank-lead">
                      {page.selected.name} · {page.host.name}님과의 자리. 순위는
                      매기지 않습니다.
                    </p>
                  </article>
                ) : (
                    <p className="sidebar-empty">
                      이름과 생년월일을 넣으면 시너지를 볼 수 있습니다.
                    </p>
                )}
              </div>
            )}

            {page.error && (page.mine || page.isHost) && (
              <p className="form-error" role="alert">
                {page.error}
              </p>
            )}

            <p>
              <a className="auth-button" href="/">
                메인 해석으로
              </a>
            </p>
          </section>
        )}
      </main>
      <SiteFooter />
      <Toast message={page.toast} leaving={page.toastLeaving} />
    </div>
  )
}
