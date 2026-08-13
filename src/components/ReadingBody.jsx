import { formatSajuText } from '../formatSajuText'

export function ReadingBody({ reply }) {
  return (
    <div className="reading-body">
      {formatSajuText(reply).map((item, i) =>
        item.type === 'heading' ? (
          <h4 key={`h-${i}`} className="reading-subhead" style={{ '--i': i }}>
            {item.text}
          </h4>
        ) : (
          <p key={`p-${i}`} style={{ '--i': i }}>
            {item.parts.map((part, j) =>
              part.bold ? (
                <strong key={j}>{part.text}</strong>
              ) : (
                <span key={j}>{part.text}</span>
              ),
            )}
          </p>
        ),
      )}
    </div>
  )
}
