import { NextRequest, NextResponse } from 'next/server'
import { glmClient, GLM_MODEL } from '@/lib/ai/glm'

export interface DilemmaLog {
  content: string
  followups: { question: string; answer: string }[]
}

export interface AnalyzeResponse {
  axes: {
    label: string
    evidence: string[]
  }[]
}

const SYSTEM_PROMPT = `あなたは判断パターン分析の専門家です。
ユーザーの過去の迷いログ（迷いの内容とフォローアップ質問への回答）を分析し、繰り返し現れる判断軸を抽出してください。

ルール:
- 判断軸は2〜5個
- 各軸にラベルをつける（例: 「安定より挑戦を選ぶ」「他者の期待より自分の直感を優先」）
- 各軸の根拠として、該当するログの内容を引用する
- 回答はJSON形式のみ（説明不要）

出力フォーマット:
{"axes":[{"label":"軸ラベル","evidence":["引用1","引用2"]}]}`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { logs } = body as { logs: DilemmaLog[] }

    if (!Array.isArray(logs)) {
      return NextResponse.json(
        { error: 'ログデータが不正です' },
        { status: 400 },
      )
    }

    if (logs.length < 5) {
      return NextResponse.json(
        { error: '分析には5件以上のログが必要です' },
        { status: 400 },
      )
    }

    const logsText = logs.map((log, i) => {
      const followupText = log.followups
        .map(f => `  Q: ${f.question}\n  A: ${f.answer}`)
        .join('\n')
      return `--- ログ${i + 1} ---\n迷い: ${log.content}\n${followupText}`
    }).join('\n\n')

    const completion = await glmClient.chat.completions.create({
      model: GLM_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: logsText },
      ],
      temperature: 0.5,
      max_tokens: 1024,
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AIからの応答を解析できませんでした' },
        { status: 502 },
      )
    }

    const parsed: AnalyzeResponse = JSON.parse(jsonMatch[0])

    if (!Array.isArray(parsed.axes) || parsed.axes.length === 0) {
      return NextResponse.json(
        { error: 'AIからの応答を解析できませんでした' },
        { status: 502 },
      )
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Analysis failed:', error)

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
      { error: '分析に失敗しました' },
      { status: 500 },
    )
  }
}
