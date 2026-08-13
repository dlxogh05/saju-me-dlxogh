export async function askGemini(prompt) {
  const KEY = import.meta.env.VITE_GEMINI_API_KEY
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    'gemini-3.6-flash:generateContent?key=' +
    KEY

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  const data = await res.json()

  if (!res.ok || !data.candidates?.[0]) {
    throw new Error(data.error?.message ?? '사주 해석 요청에 실패했습니다.')
  }

  return data.candidates[0].content.parts[0].text
}
