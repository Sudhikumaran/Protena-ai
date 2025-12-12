const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions'
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

const missingKeyError = () => {
  const error = new Error('Missing OPENAI_API_KEY environment variable')
  error.statusCode = 503
  return error
}

const normalizeMessageContent = (messageContent) => {
  if (typeof messageContent === 'string') return messageContent
  if (Array.isArray(messageContent)) {
    return messageContent
      .map((part) => {
        if (typeof part === 'string') return part
        if (typeof part?.text === 'string') return part.text
        return ''
      })
      .join('\n')
      .trim()
  }
  if (messageContent && typeof messageContent === 'object' && 'text' in messageContent) {
    return String(messageContent.text)
  }
  return ''
}

export async function generateChatCompletion({ systemPrompt, userPrompt, temperature = 0.35 }) {
  if (!process.env.OPENAI_API_KEY) {
    throw missingKeyError()
  }

  const payload = {
    model: OPENAI_MODEL,
    temperature,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    const error = new Error('AI provider returned an error')
    error.statusCode = response.status
    error.meta = { body: errorBody }
    throw error
  }

  const data = await response.json()
  const messageContent = data?.choices?.[0]?.message?.content
  const content = normalizeMessageContent(messageContent)
  if (!content) {
    const error = new Error('AI provider returned an empty response')
    error.statusCode = 502
    throw error
  }

  return {
    content,
    model: OPENAI_MODEL,
    usage: data?.usage || null,
  }
}
