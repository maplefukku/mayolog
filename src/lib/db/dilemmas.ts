import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Dilemma } from '@/types/database'

type Client = SupabaseClient<Database>

export async function createDilemma(
  client: Client,
  params: { userId: string; content: string },
): Promise<Dilemma> {
  const { data, error } = await client
    .from('dilemmas')
    .insert({ user_id: params.userId, content: params.content })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDilemmasByUser(
  client: Client,
  userId: string,
  options?: { limit?: number; offset?: number },
): Promise<Dilemma[]> {
  let query = client
    .from('dilemmas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (options?.limit) query = query.limit(options.limit)
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1)

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getDilemmaById(
  client: Client,
  id: string,
): Promise<Dilemma | null> {
  const { data, error } = await client
    .from('dilemmas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function deleteDilemma(
  client: Client,
  id: string,
): Promise<void> {
  const { error } = await client.from('dilemmas').delete().eq('id', id)
  if (error) throw error
}
