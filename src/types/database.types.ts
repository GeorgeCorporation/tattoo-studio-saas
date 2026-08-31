export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointment_reminders: {
        Row: {
          appointment_id: string
          channel: string
          created_at: string
          error_message: string | null
          id: string
          scheduled_for: string
          sent_at: string | null
          status: string
          studio_id: string
        }
        Insert: {
          appointment_id: string
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          studio_id: string
        }
        Update: {
          appointment_id?: string
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_reminders_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          artist_id: string | null
          client_id: string | null
          client_source: string
          created_at: string
          date: string
          description: string | null
          id: string
          notes: string | null
          service_id: string | null
          signal_paid: number
          status: string
          studio_id: string
          time: string
          total_price: number | null
        }
        Insert: {
          artist_id?: string | null
          client_id?: string | null
          client_source?: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          notes?: string | null
          service_id?: string | null
          signal_paid?: number
          status?: string
          studio_id: string
          time: string
          total_price?: number | null
        }
        Update: {
          artist_id?: string | null
          client_id?: string | null
          client_source?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          service_id?: string | null
          signal_paid?: number
          status?: string
          studio_id?: string
          time?: string
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "tattoo_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_restrict_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_access_invites: {
        Row: {
          accepted_at: string | null
          artist_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          status: string
          studio_id: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          artist_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          status?: string
          studio_id: string
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          artist_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          status?: string
          studio_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_access_invites_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: true
            referencedRelation: "tattoo_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_access_invites_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_commission_rules: {
        Row: {
          artist_id: string
          cap_enabled: boolean
          created_at: string
          id: string
          is_active: boolean
          monthly_cap: number | null
          notes: string | null
          percentage: number
          starts_at: string
          studio_id: string
        }
        Insert: {
          artist_id: string
          cap_enabled?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_cap?: number | null
          notes?: string | null
          percentage: number
          starts_at?: string
          studio_id: string
        }
        Update: {
          artist_id?: string
          cap_enabled?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_cap?: number | null
          notes?: string | null
          percentage?: number
          starts_at?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_commission_rules_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "tattoo_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_commission_rules_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_services: {
        Row: {
          artist_id: string
          created_at: string
          display_order: number
          duration_override_minutes: number | null
          id: string
          is_enabled: boolean
          price_override: number | null
          service_id: string
          studio_id: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          display_order?: number
          duration_override_minutes?: number | null
          id?: string
          is_enabled?: boolean
          price_override?: number | null
          service_id: string
          studio_id: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          display_order?: number
          duration_override_minutes?: number | null
          id?: string
          is_enabled?: boolean
          price_override?: number | null
          service_id?: string
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_services_studio_id_artist_id_fkey"
            columns: ["studio_id", "artist_id"]
            isOneToOne: false
            referencedRelation: "tattoo_artists"
            referencedColumns: ["studio_id", "id"]
          },
          {
            foreignKeyName: "artist_services_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_services_studio_id_service_id_fkey"
            columns: ["studio_id", "service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["studio_id", "id"]
          },
        ]
      }
      client_deliveries: {
        Row: {
          appointment_id: string | null
          client_id: string
          created_at: string
          expires_at: string | null
          id: string
          message: string | null
          studio_id: string
          title: string
          token: string
        }
        Insert: {
          appointment_id?: string | null
          client_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          studio_id: string
          title?: string
          token?: string
        }
        Update: {
          appointment_id?: string | null
          client_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          studio_id?: string
          title?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_deliveries_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_deliveries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_deliveries_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      client_delivery_photos: {
        Row: {
          created_at: string
          delivery_id: string
          file_name: string | null
          id: string
          studio_id: string
          url: string
        }
        Insert: {
          created_at?: string
          delivery_id: string
          file_name?: string | null
          id?: string
          studio_id: string
          url: string
        }
        Update: {
          created_at?: string
          delivery_id?: string
          file_name?: string | null
          id?: string
          studio_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_delivery_photos_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "client_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_delivery_photos_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          id: string
          instagram: string | null
          name: string
          notes: string | null
          phone: string | null
          studio_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          instagram?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          studio_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          instagram?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          artist_id: string | null
          created_at: string
          id: string
          studio_id: string
          type: string
          url: string
        }
        Insert: {
          artist_id?: string | null
          created_at?: string
          id?: string
          studio_id: string
          type?: string
          url: string
        }
        Update: {
          artist_id?: string | null
          created_at?: string
          id?: string
          studio_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "tattoo_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_commissions: {
        Row: {
          appointment_id: string | null
          artist_id: string | null
          base_amount: number
          cap_applied: boolean
          cap_consumed_amount: number
          client_source: string
          commission_amount: number
          created_at: string
          id: string
          payment_id: string
          percentage: number
          raw_commission_amount: number
          rule_id: string | null
          studio_id: string
        }
        Insert: {
          appointment_id?: string | null
          artist_id?: string | null
          base_amount?: number
          cap_applied?: boolean
          cap_consumed_amount?: number
          client_source?: string
          commission_amount?: number
          created_at?: string
          id?: string
          payment_id: string
          percentage?: number
          raw_commission_amount?: number
          rule_id?: string | null
          studio_id: string
        }
        Update: {
          appointment_id?: string | null
          artist_id?: string | null
          base_amount?: number
          cap_applied?: boolean
          cap_consumed_amount?: number
          client_source?: string
          commission_amount?: number
          created_at?: string
          id?: string
          payment_id?: string
          percentage?: number
          raw_commission_amount?: number
          rule_id?: string | null
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_commissions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commissions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "tattoo_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commissions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commissions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "artist_commission_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commissions_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string
          id: string
          method: string | null
          paid_at: string | null
          studio_id: string
          type: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string
          id?: string
          method?: string | null
          paid_at?: string | null
          studio_id: string
          type?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string
          id?: string
          method?: string | null
          paid_at?: string | null
          studio_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          client_name: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number | null
          studio_id: string
        }
        Insert: {
          client_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          studio_id: string
        }
        Update: {
          client_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          avg_duration_minutes: number | null
          category: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          starting_price: number | null
          studio_id: string
        }
        Insert: {
          avg_duration_minutes?: number | null
          category?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          starting_price?: number | null
          studio_id: string
        }
        Update: {
          avg_duration_minutes?: number | null
          category?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          starting_price?: number | null
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          name: string
          slug: string
          state: string | null
          user_id: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name: string
          slug: string
          state?: string | null
          user_id: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name?: string
          slug?: string
          state?: string | null
          user_id?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      tattoo_artists: {
        Row: {
          access_email: string | null
          auth_user_id: string | null
          bio: string | null
          created_at: string
          id: string
          instagram: string | null
          is_active: boolean
          name: string
          photo_url: string | null
          slug: string
          specialty: string | null
          studio_id: string
          whatsapp: string | null
        }
        Insert: {
          access_email?: string | null
          auth_user_id?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          is_active?: boolean
          name: string
          photo_url?: string | null
          slug: string
          specialty?: string | null
          studio_id: string
          whatsapp?: string | null
        }
        Update: {
          access_email?: string | null
          auth_user_id?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          is_active?: boolean
          name?: string
          photo_url?: string | null
          slug?: string
          specialty?: string | null
          studio_id?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tattoo_artists_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      working_hours: {
        Row: {
          close_time: string | null
          day_of_week: number
          id: string
          is_open: boolean
          open_time: string | null
          studio_id: string
        }
        Insert: {
          close_time?: string | null
          day_of_week: number
          id?: string
          is_open?: boolean
          open_time?: string | null
          studio_id: string
        }
        Update: {
          close_time?: string | null
          day_of_week?: number
          id?: string
          is_open?: boolean
          open_time?: string | null
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_artist_invite: {
        Args: { p_email: string; p_token: string }
        Returns: Json
      }
      current_user_artist_id: { Args: { p_studio_id: string }; Returns: string }
      current_user_can_view_client: {
        Args: { p_client_id: string; p_studio_id: string }
        Returns: boolean
      }
      current_user_can_view_delivery: {
        Args: { p_appointment_id: string; p_studio_id: string }
        Returns: boolean
      }
      current_user_is_artist_for_appointment: {
        Args: { p_artist_id: string; p_studio_id: string }
        Returns: boolean
      }
      get_artist_invite_by_token: { Args: { p_token: string }; Returns: Json }
      get_booked_appointment_times: {
        Args: { p_artist_id: string; p_date: string; p_studio_id: string }
        Returns: {
          booked_time: string
        }[]
      }
      get_client_delivery_by_token: { Args: { p_token: string }; Returns: Json }
      storage_path_part: {
        Args: { object_name: string; part_index: number }
        Returns: string
      }
      update_public_appointment_notes: {
        Args: { p_appointment_id: string; p_notes: string }
        Returns: undefined
      }
      user_owns_storage_studio: {
        Args: { object_name: string }
        Returns: boolean
      }
      valid_public_booking_reference_path: {
        Args: { object_name: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
