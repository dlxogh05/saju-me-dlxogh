const TOPICS = [
  { kind: 'basic', label: '성격' },
  { kind: 'love', label: '연애' },
  { kind: 'wealth', label: '재물' },
]

export function TopicPick({ loading, onPick }) {
  return (
    <fieldset className="form-block">
      <p className="form-block-title">해석</p>
      <div className="topic-seg" role="group" aria-label="해석 종류">
        {TOPICS.map((topic) => (
          <button
            key={topic.kind}
            type="button"
            className="topic-seg-item"
            disabled={loading}
            onClick={() => onPick(topic.kind)}
          >
            {topic.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
