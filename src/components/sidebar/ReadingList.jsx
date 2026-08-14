import { readingListLabel } from '../../lib/readingSubject'

export function ReadingList({
  user,
  readings,
  activeReadingId,
  onSelect,
  onDelete,
}) {
  if (!user) {
    return (
      <p className="sidebar-empty">
        로그인하면 과거 기록이 여기에 남습니다. 비로그인 해석은 새로고침 후
        사라집니다.
      </p>
    )
  }

  if (readings.length === 0) {
    return <p className="sidebar-empty">아직 저장된 기록이 없습니다.</p>
  }

  return (
    <ul className="reading-list">
      {readings.map((reading) => (
        <li key={reading.id} className="reading-row">
          <button
            type="button"
            className={
              reading.id === activeReadingId
                ? 'reading-item is-active'
                : 'reading-item'
            }
            onClick={() => onSelect(reading)}
          >
            {readingListLabel(reading)}
          </button>
          <div className="reading-actions">
            <button
              type="button"
              className="reading-action is-danger"
              onClick={(e) => onDelete(reading, e)}
              aria-label={`${readingListLabel(reading)} 삭제`}
              title="삭제"
            >
              삭제
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
