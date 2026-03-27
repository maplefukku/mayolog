import { NextRequest, NextResponse } from 'next/server'
import { glmClient, GLM_MODEL } from '@/lib/ai/glm'

export interface QuestionResponse {
  questions: {
    text: string
    options: string[]
  }[]
}

const SYSTEM_PROMPT = `あなたは意思決定をサポートするカウンセラーです。
ユーザーが迷っていることに対して、「なぜ迷っているか」ではなく「何を失いたくないか」「何を得たいか」を引き出す質問を1〜2問だけ作成してください。

ルール:
- 質問は1〜2問のみ
- 各質問に2〜3個の選択肢をつける
- 選択肢は具体的で、ユーザーの本音が表れるものにする
- 回答はJSON形式のみ（説明不要）

出力フォーマット:
{"questions":[{"text":"質問文","options":["選択肢1","選択肢2"]}]}`

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

    if (dilemma.length > 200) {
      return NextResponse.json(
        { error: '200文字以内で入力してください' },
        { status: 400 },
      )
    }

    const completion = await glmClient.chat.completions.create({
      model: GLM_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: dilemma },
      ],
      temperature: 0.7,
      max_tokens: 512,
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AIからの応答を解析できませんでした' },
        { status: 502 },
      )
    }

    const parsed: QuestionResponse = JSON.parse(jsonMatch[0])

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return NextResponse.json(
        { error: 'AIからの応答を解析できませんでした' },
        { status: 502 },
      )
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Question generation failed:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'AIからの応答を解析できませんでした' },
        { status: 502 },
      )
    }

    const isTimeout = error instanceof Error && error.message.includes('timed out')
    if (isTimeout) {
      return NextResponse.json(
        { error: 'AIの応答がタイムアウトしました。しばらく待ってから再度お試しください。' },
        { status: 504 },
      )
    }

    return NextResponse.json(
      { error: 'AI質問生成に失敗しました。質問なしで記録を続けてください。' },
      { status: 500 },
    )
  }
}
