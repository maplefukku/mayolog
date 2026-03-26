export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dilemmas: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          content?: string
        }
        Relationships: [
          {
            foreignKeyName: 'dilemmas_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      followup_responses: {
        Row: {
          id: string
          dilemma_id: string
          question: string
          answer: string
          created_at: string
        }
        Insert: {
          id?: string
          dilemma_id: string
          question: string
          answer: string
          created_at?: string
        }
        Update: {
          question?: string
          answer?: string
        }
        Relationships: [
          {
            foreignKeyName: 'followup_responses_dilemma_id_fkey'
            columns: ['dilemma_id']
            isOneToOne: false
            referencedRelation: 'dilemmas'
            referencedColumns: ['id']
          },
        ]
      }
      axis_analyses: {
        Row: {
          id: string
          user_id: string
          axes: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          axes: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          axes?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'axis_analyses_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export interface Axis {
  label: string
  evidence: string[]
}

// 便利な型エイリアス
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Dilemma = Database['public']['Tables']['dilemmas']['Row']
export type FollowupResponse = Database['public']['Tables']['followup_responses']['Row']
export type AxisAnalysisRow = Database['public']['Tables']['axis_analyses']['Row']
export interface AxisAnalysis extends Omit<AxisAnalysisRow, 'axes'> {
  axes: Axis[]
}
