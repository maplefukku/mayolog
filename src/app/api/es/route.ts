import { NextRequest, NextResponse } from 'next/server'
import { glmClient, GLM_MODEL } from '@/lib/ai/glm'
import { badRequest, serverError, gatewayError, gatewayTimeout } from '@/lib/api/errors'

type Format = 'es' | 'interview' | 'intro'

interface Axis {
  label: string
  value: number
}

const prompts: Record<Format, (axesText: string) => string> = {
  es: (axesText) => `以下の判断軸から、就活のエントリーシートで使える400字程度の「私の判断基準」文章を生成してください。正式な文章で、「私は...」から始めてください。

判断軸:
${axesText}

要件:
- 400字程度
- 正式な文章
- 具体的なエピソードを含める
- 判断基準が明確に伝わる内容`,

  interview: (axesText) => `以下の判断軸から、面接で話せる300字程度の「私の判断基準」を口語体で生成してください。

判断軸:
${axesText}

要件:
- 300字程度
- 口語体（話し言葉）
- 「私は...だと考えています」形式
- 具体的なエピソードを含める`,

  intro: (axesText) => `以下の判断軸から、自己紹介で使える100-150字の短文を生成してください。

判断軸:
${axesText}

要件:
- 100-150字
- 簡潔に判断基準を伝える
- 親しみやすいトーン`,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { axes, format } = body as { axes: Axis[]; format: string }

    if (!Array.isArray(axes) || axes.length === 0) {
      return badRequest('判断軸データが不正です')
    }

    const validFormat: Format = (format === 'interview' || format === 'intro') ? format : 'es'
    const axesText = axes.map((a) => `- ${a.label}: ${a.value}%`).join('\n')
    const prompt = prompts[validFormat](axesText)

    const completion = await glmClient.chat.completions.create({
      model: GLM_MODEL,
      messages: [
        {
          role: 'system',
          content: 'あなたは就活支援の専門家です。ユーザーの判断軸データから、就活で使える自然な日本語の文章を生成してください。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    })

    const text = completion.choices[0]?.message?.content ?? ''

    if (!text.trim()) {
      return gatewayError('AIからの応答が空でした')
    }

    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    console.error('ES generation failed:', error)

    const isTimeout = error instanceof Error && error.message.includes('timed out')
    if (isTimeout) {
      return gatewayTimeout('AIの応答がタイムアウトしました。しばらく待ってから再度お試しください。')
    }

    return serverError('生成に失敗しました')
  }
}
