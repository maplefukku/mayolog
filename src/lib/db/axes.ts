import type { SupabaseClient } from '@supabase/supabase-js'
import type { Axis, AxisAnalysis, AxisAnalysisRow, Database, Json } from '@/types/database'

type Client = SupabaseClient<Database>

function toAxisAnalysis(row: AxisAnalysisRow): AxisAnalysis {
  return { ...row, axes: row.axes as unknown as Axis[] }
}

export async function upsertAxisAnalysis(
  client: Client,
  params: { userId: string; axes: Axis[] },
): Promise<AxisAnalysis> {
  // 既存の分析結果を探す
  const { data: existing, error: findError } = await client
    .from('axis_analyses')
    .select('id')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (findError && findError.code !== 'PGRST116') throw findError

  if (existing) {
    const { data, error } = await client
      .from('axis_analyses')
      .update({ axes: params.axes as unknown as Json })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return toAxisAnalysis(data)
  }

  const { data, error } = await client
    .from('axis_analyses')
    .insert({ user_id: params.userId, axes: params.axes as unknown as Json })
    .select()
    .single()

  if (error) throw error
  return toAxisAnalysis(data)
}

export async function getLatestAxisAnalysis(
  client: Client,
  userId: string,
): Promise<AxisAnalysis | null> {
  const { data, error } = await client
    .from('axis_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return toAxisAnalysis(data)
}

export async function getAxisAnalysisHistory(
  client: Client,
  userId: string,
): Promise<AxisAnalysis[]> {
  const { data, error } = await client
    .from('axis_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(toAxisAnalysis)
}
