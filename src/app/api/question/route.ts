import { NextRequest, NextResponse } from 'next/server'
import { glmClient, GLM_MODEL } from '@/lib/ai/glm'

export interface QuestionResponse {
  questions: {
    text: string
    options: string[]
  }[]
}

const CATEGORY_HINTS: Record<string, string> = {
  career: '仕事・キャリアの迷いです。長期的なキャリアパス、スキル成長、安定性vs挑戦などの観点から質問してください。',
  relationship: '人間関係の迷いです。相手との関係性、自分の気持ちと相手への配慮のバランスなどの観点から質問してください。',
  time: '時間管理の迷いです。優先順位、後悔の可能性、休息と成長のバランスなどの観点から質問してください。',
  self: '自己実現の迷いです。挑戦したい気持ちの強さ、リスクとリターン、成長への意欲などの観点から質問してください。',
  daily: '日常的な迷いです。直感、今の自分に必要なもの、満足感などの観点から質問してください。',
}

function buildSystemPrompt(category?: string): string {
  const categoryHint = category && CATEGORY_HINTS[category]
    ? `\nカテゴリ情報: ${CATEGORY_HINTS[category]}`
    : ''

  return `あなたは意思決定をサポートするカウンセラーです。
ユーザーが迷っていることに対して、「なぜ迷っているか」ではなく「何を失いたくないか」「何を得たいか」を引き出す質問を1〜2問だけ作成してください。
${categoryHint}
ルール:
- 質問は1〜2問のみ
- 各質問に2〜3個の選択肢をつける
- 選択肢は具体的で、ユーザーの本音が表れるものにする
- 回答はJSON形式のみ（説明不要）

出力フォーマット:
{"questions":[{"text":"質問文","options":["選択肢1","選択肢2"]}]}`
}

function buildDeepDiveSystemPrompt(category?: string): string {
  const categoryHint = category && CATEGORY_HINTS[category]
    ? `\nカテゴリ情報: ${CATEGORY_HINTS[category]}`
    : ''

  return `あなたは意思決定をサポートするカウンセラーです。
ユーザーの迷いと、これまでの質問・回答の履歴をもとに、さらに深い本音を引き出す追加質問を1問だけ作成してください。
${categoryHint}
ルール:
- 質問は1問のみ
- 2〜3個の選択肢をつける
- これまでの回答を踏まえて、より核心に迫る質問にする
- 過去の質問と重複しない
- 回答はJSON形式のみ（説明不要）

出力フォーマット:
{"questions":[{"text":"質問文","options":["選択肢1","選択肢2"]}]}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dilemma, history, category } = body as {
      dilemma: string
      history?: { question: string; answer: string }[]
      category?: string
    }

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

    const isDeepDive = Array.isArray(history) && history.length > 0
    const systemPrompt = isDeepDive ? buildDeepDiveSystemPrompt(category) : buildSystemPrompt(category)
    const userContent = isDeepDive
      ? `迷い: ${dilemma}\n\nこれまでの質問と回答:\n${history.map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`).join('\n')}`
      : dilemma

    const completion = await glmClient.chat.completions.create({
      model: GLM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
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
