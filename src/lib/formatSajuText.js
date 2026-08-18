const SECTION_TITLES = [
  '기질 요약',
  '성격',
  '기질과 재능',
  '약점',
  '돋보이는 특징',
  '특이한 점',
  '흐름',
  '질문을 던져라',
  '재물을 대하는 태도',
  '잘 붙는 자리',
  '그늘',
  '가까워지는 방식',
  '선을 두는 방식',
  '돈이 모이는 방식',
  '새는 자리',
  '부딪히는 지점',
]

/** **강조**만 남기고 인라인 파트로 나눕니다. */
function parseInlineParts(text) {
  const parts = []
  const re = /\*\*(.+?)\*\*/g
  let last = 0
  let match

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ text: text.slice(last, match.index), bold: false })
    }
    parts.push({ text: match[1], bold: true })
    last = match.index + match[0].length
  }

  if (last < text.length) {
    parts.push({ text: text.slice(last), bold: false })
  }

  if (!parts.length) {
    parts.push({ text, bold: false })
  }

  return parts
}

function cleanInlineMarkdown(text) {
  return text
    .replace(/__(.*?)__/g, '$1')
    .replace(/(^|[^*])\*(?!\*)([^*\n]+)\*(?!\*)/g, '$1$2')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}

/** Gemini 응답을 소제목/문단으로 나누고, 최소한의 볼드만 보존합니다. */
export function formatSajuText(raw) {
  if (!raw) return []

  const cleaned = raw
    .replace(/\r\n/g, '\n')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^[\s]*[-*•▪◦]\s+/gm, '')
    .replace(/^\d+[.)]\s+/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim()

  const lines = cleaned
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const items = []
  let buffer = []

  function flushBody() {
    if (!buffer.length) return
    const text = buffer.join(' ')
    items.push({ type: 'body', text, parts: parseInlineParts(text) })
    buffer = []
  }

  function matchKnownHeading(line) {
    const normalized = line
      .replace(/^#{1,6}\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/[:：.。]\s*$/, '')
      .trim()
    return SECTION_TITLES.find((title) => normalized === title) ?? null
  }

  for (const line of lines) {
    const mdHeading = line.match(/^#{1,6}\s+(.+)$/)
    if (mdHeading) {
      flushBody()
      const headingText =
        matchKnownHeading(line) ??
        cleanInlineMarkdown(mdHeading[1]).replace(/\*\*/g, '')
      items.push({ type: 'heading', text: headingText })
      continue
    }

    const known = matchKnownHeading(line)
    if (known) {
      flushBody()
      items.push({ type: 'heading', text: known })
      continue
    }

    buffer.push(cleanInlineMarkdown(line))
  }

  flushBody()
  return items
}
