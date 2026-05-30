import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key, x-provider, x-model')
  return res
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }))
}

export async function POST(request) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const provider = (request.headers.get('x-provider') || 'anthropic').toLowerCase()
    const modelOverride = request.headers.get('x-model')

    if (!apiKey) {
      return cors(NextResponse.json({ error: 'Missing x-api-key header' }, { status: 400 }))
    }

    const body = await request.json()
    const { system, user, jsonMode = true } = body

    if (!user) {
      return cors(NextResponse.json({ error: 'Missing user prompt' }, { status: 400 }))
    }

    let text = ''

    if (provider === 'anthropic') {
      const model = modelOverride || 'claude-sonnet-4-20250514'
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 8000,
          system: system || 'You are a helpful assistant.',
          messages: [{ role: 'user', content: user }],
        }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        return cors(NextResponse.json({ error: data?.error?.message || 'Anthropic error', raw: data }, { status: resp.status }))
      }
      text = data?.content?.[0]?.text || ''
    } else if (provider === 'google' || provider === 'gemini') {
      const model = modelOverride || 'gemini-2.0-flash'
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
      const reqBody = {
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8000,
          responseMimeType: jsonMode ? 'application/json' : 'text/plain',
        },
      }
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(reqBody),
      })
      const data = await resp.json()
      if (!resp.ok) {
        return cors(NextResponse.json({ error: data?.error?.message || 'Gemini error', raw: data }, { status: resp.status }))
      }
      text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || ''
    } else {
      return cors(NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 }))
    }

    return cors(NextResponse.json({ text }))
  } catch (e) {
    return cors(NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 }))
  }
}
