import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} を .env.local に設定してください`)
  }
  return value
}

export function createClient() {
  return createBrowserClient<Database>(
    getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  )
}
