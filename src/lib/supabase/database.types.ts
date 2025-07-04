export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      avatar_permissions: {
        Row: {
          avatar_id: string
          avatar_value: Json | null
          created_at: string | null
          effective_value: Json | null
          id: string
          is_restricted: boolean | null
          last_computed: string | null
          policy_id: string
          restriction_message: string | null
          restriction_source: string | null
        }
        Insert: {
          avatar_id: string
          avatar_value?: Json | null
          created_at?: string | null
          effective_value?: Json | null
          id?: string
          is_restricted?: boolean | null
          last_computed?: string | null
          policy_id: string
          restriction_message?: string | null
          restriction_source?: string | null
        }
        Update: {
          avatar_id?: string
          avatar_value?: Json | null
          created_at?: string | null
          effective_value?: Json | null
          id?: string
          is_restricted?: boolean | null
          last_computed?: string | null
          policy_id?: string
          restriction_message?: string | null
          restriction_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avatar_permissions_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avatar_permissions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "permission_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      avatars: {
        Row: {
          created_at: string | null
          encrypted_pii: Json | null
          game_preferences: Json | null
          id: string
          last_active: string | null
          name: string
          org_id: string | null
          theme_settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_pii?: Json | null
          game_preferences?: Json | null
          id?: string
          last_active?: string | null
          name: string
          org_id?: string | null
          theme_settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_pii?: Json | null
          game_preferences?: Json | null
          id?: string
          last_active?: string | null
          name?: string
          org_id?: string | null
          theme_settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avatars_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avatars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_collections: {
        Row: {
          avatar_id: string
          can_be_copied: boolean | null
          collaborator_user_ids: string[] | null
          collection_type: string | null
          created_at: string | null
          created_by_user_id: string
          description: string | null
          game_ids: string[]
          id: string
          is_deletable: boolean | null
          is_editable: boolean | null
          last_played: string | null
          name: string
          org_id: string | null
          play_count: number | null
          scheduled_sessions: Json | null
          share_scope: string | null
          shared_at: string | null
          shared_by_user_id: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_id: string
          can_be_copied?: boolean | null
          collaborator_user_ids?: string[] | null
          collection_type?: string | null
          created_at?: string | null
          created_by_user_id: string
          description?: string | null
          game_ids?: string[]
          id?: string
          is_deletable?: boolean | null
          is_editable?: boolean | null
          last_played?: string | null
          name: string
          org_id?: string | null
          play_count?: number | null
          scheduled_sessions?: Json | null
          share_scope?: string | null
          shared_at?: string | null
          shared_by_user_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_id?: string
          can_be_copied?: boolean | null
          collaborator_user_ids?: string[] | null
          collection_type?: string | null
          created_at?: string | null
          created_by_user_id?: string
          description?: string | null
          game_ids?: string[]
          id?: string
          is_deletable?: boolean | null
          is_editable?: boolean | null
          last_played?: string | null
          name?: string
          org_id?: string | null
          play_count?: number | null
          scheduled_sessions?: Json | null
          share_scope?: string | null
          shared_at?: string | null
          shared_by_user_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_collections_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_collections_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_collections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_collections_shared_by_user_id_fkey"
            columns: ["shared_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_events: {
        Row: {
          avatar_id: string
          event_data: Json
          event_type: string
          id: string
          sequence_number: number
          session_id: string
          timestamp: string
        }
        Insert: {
          avatar_id: string
          event_data?: Json
          event_type: string
          id?: string
          sequence_number: number
          session_id: string
          timestamp?: string
        }
        Update: {
          avatar_id?: string
          event_data?: Json
          event_type?: string
          id?: string
          sequence_number?: number
          session_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_events_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          avatar_id: string
          completion_status: string | null
          created_at: string | null
          difficulty_level: string
          game_type: string
          id: string
          org_id: string | null
          questions_attempted: number | null
          questions_correct: number | null
          score_data: Json
          session_end: string | null
          session_start: string
          settings_used: Json | null
          total_duration: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_id: string
          completion_status?: string | null
          created_at?: string | null
          difficulty_level?: string
          game_type: string
          id?: string
          org_id?: string | null
          questions_attempted?: number | null
          questions_correct?: number | null
          score_data?: Json
          session_end?: string | null
          session_start?: string
          settings_used?: Json | null
          total_duration?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_id?: string
          completion_status?: string | null
          created_at?: string | null
          difficulty_level?: string
          game_type?: string
          id?: string
          org_id?: string | null
          questions_attempted?: number | null
          questions_correct?: number | null
          score_data?: Json
          session_end?: string | null
          session_start?: string
          settings_used?: Json | null
          total_duration?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          avatar_id: string
          average_performance: number | null
          created_at: string | null
          game_type: string
          id: string
          improvement_trend: string | null
          last_played: string
          last_processed: string | null
          learning_objectives_met: string[] | null
          mastery_score: number | null
          needs_realtime_update: boolean | null
          org_id: string | null
          prerequisite_completion: Json | null
          skill_level: string
          total_sessions: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_id: string
          average_performance?: number | null
          created_at?: string | null
          game_type: string
          id?: string
          improvement_trend?: string | null
          last_played: string
          last_processed?: string | null
          learning_objectives_met?: string[] | null
          mastery_score?: number | null
          needs_realtime_update?: boolean | null
          org_id?: string | null
          prerequisite_completion?: Json | null
          skill_level?: string
          total_sessions?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_id?: string
          average_performance?: number | null
          created_at?: string | null
          game_type?: string
          id?: string
          improvement_trend?: string | null
          last_played?: string
          last_processed?: string | null
          learning_objectives_met?: string[] | null
          mastery_score?: number | null
          needs_realtime_update?: boolean | null
          org_id?: string | null
          prerequisite_completion?: Json | null
          skill_level?: string
          total_sessions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_progress_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_policies: {
        Row: {
          created_at: string | null
          enforcement_level: string | null
          id: string
          is_enabled: boolean
          org_id: string
          override_value: Json | null
          policy_id: string
          restriction_message: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enforcement_level?: string | null
          id?: string
          is_enabled?: boolean
          org_id: string
          override_value?: Json | null
          policy_id: string
          restriction_message?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enforcement_level?: string | null
          id?: string
          is_enabled?: boolean
          org_id?: string
          override_value?: Json | null
          policy_id?: string
          restriction_message?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_policies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_policies_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "permission_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_address: Json | null
          contact_info: Json | null
          created_at: string | null
          id: string
          name: string
          status: string | null
          subscription_plan_id: string | null
          tax_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
          subscription_plan_id?: string | null
          tax_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
          subscription_plan_id?: string | null
          tax_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_policies: {
        Row: {
          allowed_values: Json | null
          created_at: string | null
          default_value: Json | null
          description: string | null
          display_name: string
          id: string
          is_restrictive: boolean | null
          permission_scope: string
          policy_name: string
        }
        Insert: {
          allowed_values?: Json | null
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          display_name: string
          id?: string
          is_restrictive?: boolean | null
          permission_scope: string
          policy_name: string
        }
        Update: {
          allowed_values?: Json | null
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          display_name?: string
          id?: string
          is_restrictive?: boolean | null
          permission_scope?: string
          policy_name?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          active: boolean | null
          addon_discount_percent: number | null
          avatar_limit: number
          base_price: number
          basic_themes_included: boolean | null
          created_at: string | null
          custom_branding_included: boolean | null
          duration_months: number
          features_included: Json | null
          id: string
          name: string
          premium_themes_included: boolean | null
          tier: string
        }
        Insert: {
          active?: boolean | null
          addon_discount_percent?: number | null
          avatar_limit: number
          base_price: number
          basic_themes_included?: boolean | null
          created_at?: string | null
          custom_branding_included?: boolean | null
          duration_months: number
          features_included?: Json | null
          id?: string
          name: string
          premium_themes_included?: boolean | null
          tier: string
        }
        Update: {
          active?: boolean | null
          addon_discount_percent?: number | null
          avatar_limit?: number
          base_price?: number
          basic_themes_included?: boolean | null
          created_at?: string | null
          custom_branding_included?: boolean | null
          duration_months?: number
          features_included?: Json | null
          id?: string
          name?: string
          premium_themes_included?: boolean | null
          tier?: string
        }
        Relationships: []
      }
      theme_catalog: {
        Row: {
          active: boolean | null
          asset_urls: Json | null
          base_price_monthly: number | null
          base_price_yearly: number | null
          color_config: Json
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_custom_brandable: boolean | null
          is_premium: boolean | null
          name: string
          preview_image_url: string | null
          tier_required: string | null
        }
        Insert: {
          active?: boolean | null
          asset_urls?: Json | null
          base_price_monthly?: number | null
          base_price_yearly?: number | null
          color_config: Json
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_custom_brandable?: boolean | null
          is_premium?: boolean | null
          name: string
          preview_image_url?: string | null
          tier_required?: string | null
        }
        Update: {
          active?: boolean | null
          asset_urls?: Json | null
          base_price_monthly?: number | null
          base_price_yearly?: number | null
          color_config?: Json
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_custom_brandable?: boolean | null
          is_premium?: boolean | null
          name?: string
          preview_image_url?: string | null
          tier_required?: string | null
        }
        Relationships: []
      }
      user_policies: {
        Row: {
          allow_avatar_override: boolean | null
          created_at: string | null
          id: string
          is_enabled: boolean
          policy_id: string
          restriction_message: string | null
          updated_at: string | null
          user_id: string
          user_value: Json | null
        }
        Insert: {
          allow_avatar_override?: boolean | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          policy_id: string
          restriction_message?: string | null
          updated_at?: string | null
          user_id: string
          user_value?: Json | null
        }
        Update: {
          allow_avatar_override?: boolean | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          policy_id?: string
          restriction_message?: string | null
          updated_at?: string | null
          user_id?: string
          user_value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_policies_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "permission_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_policies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_type: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          locale: string | null
          org_id: string | null
          phone: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          account_type?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_login?: string | null
          last_name?: string | null
          locale?: string | null
          org_id?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_type?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          locale?: string | null
          org_id?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          id: string
          org_id: string
          email: string
          invited_by: string
          roles: string[]
          status: string
          token_hash: string
          expires_at: string
          accepted_at: string | null
          accepted_by: string | null
          message: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          invited_by: string
          roles?: string[]
          status?: string
          token_hash: string
          expires_at: string
          accepted_at?: string | null
          accepted_by?: string | null
          message?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          invited_by?: string
          roles?: string[]
          status?: string
          token_hash?: string
          expires_at?: string
          accepted_at?: string | null
          accepted_by?: string | null
          message?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          id: string
          org_id: string | null
          user_id: string | null
          action_type: string
          resource_type: string
          resource_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          user_id?: string | null
          action_type: string
          resource_type: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          user_id?: string | null
          action_type?: string
          resource_type?: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          id: string
          identifier: string
          identifier_type: string
          action_type: string
          count: number
          window_start: string
          window_end: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          identifier: string
          identifier_type: string
          action_type: string
          count?: number
          window_start: string
          window_end: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          identifier?: string
          identifier_type?: string
          action_type?: string
          count?: number
          window_start?: string
          window_end?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type Organization = {
  id: string;
  name: string;
  subscription_plan_id: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  tier: string;
  avatar_limit: number;
  features_included: any;
  [key: string]: any;
};

export type UserPolicy = {
  id: string;
  user_id: string;
  org_id: string;
  policy_id: string;
};

export type PermissionPolicy = {
  id: string;
  policy_name: string;
  description?: string;
};
