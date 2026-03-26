import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, FollowupResponse } from '@/types/database'

type Client = SupabaseClient<Database>

export async function createFollowup(
  client: Client,
  params: { dilemmaId: string; question: string; answer: string },
): Promise<FollowupResponse> {
  const { data, error } = await client
    .from('followup_responses')
    .insert({
      dilemma_id: params.dilemmaId,
      question: params.question,
      answer: params.answer,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getFollowupsByDilemma(
  client: Client,
  dilemmaId: string,
): Promise<FollowupResponse[]> {
  const { data, error } = await client
    .from('followup_responses')
    .select('*')
    .eq('dilemma_id', dilemmaId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}
