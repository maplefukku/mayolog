import { NextRequest, NextResponse } from 'next/server'
import { glmClient, GLM_MODEL } from '@/lib/ai/glm'

export const categories = ['career', 'relationship', 'time', 'self', 'daily'] as const
export type Category = (typeof categories)[number]

const SYSTEM_PROMPT = `あなたは迷いや悩みのカテゴリ分類器です。
ユーザーの迷いテキストを以下の5カテゴリのいずれかに分類してください。

カテゴリ:
- career: 仕事、就活、バイト、キャリア、転職に関する迷い
- relationship: 友人、家族、恋人、同僚など人間関係に関する迷い
- time: スケジュール、優先順位、時間の使い方に関する迷い
- self: 趣味、学習、自己成長、自己実現に関する迷い
- daily: その他の日常的な迷い

ルール:
- カテゴリ名のみを1語で返してください（説明不要）
- 必ず上記5つのうちの1つを返してください`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dilemma } = body as { dilemma: string }

    if (!dilemma || typeof dilemma !== 'string' || dilemma.trim().length === 0) {
      return NextResponse.json(
        { error: '迷いの内容を入力してください' },
        { status: 400 },
      )
    }

    const completion = await glmClient.chat.completions.create({
      model: GLM_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: dilemma },
      ],
      temperature: 0.3,
      max_tokens: 32,
    })

    const raw = (completion.choices[0]?.message?.content ?? '').trim().toLowerCase()
    const category = categories.find((c) => raw.includes(c)) ?? 'daily'

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Classification failed:', error)
    return NextResponse.json(
      { category: 'daily' },
    )
  }
}
