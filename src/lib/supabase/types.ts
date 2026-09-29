export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      spots: {
        Row: {
          id: number
          city: string
          name_ko: string
          name_en: string
          name_ja: string
          area_ko: string
          area_en: string | null
          area_ja: string | null
          category: string
          lat: number
          lng: number
          base_crowd_score: number
          peak_hours: number[]
          best_time_ko: string | null
          best_time_en: string | null
          best_time_ja: string | null
          tip_ko: string | null
          tip_en: string | null
          tip_ja: string | null
          emoji: string
          photo_url: string | null
          escape_gem_name_ko: string | null
          escape_gem_name_en: string | null
          escape_gem_name_ja: string | null
          escape_gem_desc_ko: string | null
          escape_gem_desc_en: string | null
          escape_gem_desc_ja: string | null
          escape_walk_minutes: number
          affiliate_provider: string | null
          affiliate_url: string | null
          affiliate_badge_text_ko: string | null
          affiliate_badge_text_en: string | null
          affiliate_badge_text_ja: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          city: string
          name_ko: string
          name_en: string
          name_ja: string
          area_ko: string
          area_en?: string | null
          area_ja?: string | null
          category: string
          lat: number
          lng: number
          base_crowd_score?: number
          peak_hours?: number[]
          best_time_ko?: string | null
          best_time_en?: string | null
          best_time_ja?: string | null
          tip_ko?: string | null
          tip_en?: string | null
          tip_ja?: string | null
          emoji?: string
          photo_url?: string | null
          escape_gem_name_ko?: string | null
          escape_gem_name_en?: string | null
          escape_gem_name_ja?: string | null
          escape_gem_desc_ko?: string | null
          escape_gem_desc_en?: string | null
          escape_gem_desc_ja?: string | null
          escape_walk_minutes?: number
          affiliate_provider?: string | null
          affiliate_url?: string | null
          affiliate_badge_text_ko?: string | null
          affiliate_badge_text_en?: string | null
          affiliate_badge_text_ja?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          [key: string]: unknown
        }
      }
      crowd_metrics: {
        Row: {
          id: string
          spot_id: number
          current_score: number
          status_level: 'relaxed' | 'moderate' | 'packed'
          wait_time_minutes: number
          surge_alert: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          spot_id: number
          current_score: number
          status_level: 'relaxed' | 'moderate' | 'packed'
          wait_time_minutes?: number
          surge_alert?: boolean
          updated_at?: string
        }
        Update: {
          [key: string]: unknown
        }
      }
      quiz_leads: {
        Row: {
          id: string
          email: string
          quiz_type: string
          result_code: string
          selected_city: string
          referred_from: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          quiz_type: string
          result_code: string
          selected_city: string
          referred_from?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          created_at?: string
        }
        Update: {
          [key: string]: unknown
        }
      }
      campaign_leads: {
        Row: {
          id: string
          email: string
          target_city: string
          quiz_score: number
          user_tier: string
          preferred_style: string | null
          coupon_code: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          target_city: string
          quiz_score: number
          user_tier: string
          preferred_style?: string | null
          coupon_code?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          created_at?: string
        }
        Update: {
          [key: string]: unknown
        }
      }
    }
  }
}
