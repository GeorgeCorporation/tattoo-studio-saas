export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      appointment_reminders: {
        Row: {
          id: string;
          studio_id: string;
          appointment_id: string;
          channel: string;
          scheduled_for: string;
          status: string;
          sent_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          studio_id: string;
          appointment_id: string;
          channel?: string;
          scheduled_for: string;
          status?: string;
          sent_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointment_reminders"]["Insert"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          studio_id: string;
          artist_id: string | null;
          client_id: string | null;
          service_id: string | null;
          date: string;
          time: string;
          client_source: string;
          status: string;
          description: string | null;
          signal_paid: number;
          total_price: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          studio_id: string;
          artist_id?: string | null;
          client_id?: string | null;
          service_id?: string | null;
          date: string;
          time: string;
          client_source?: string;
          status?: string;
          description?: string | null;
          signal_paid?: number;
          total_price?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          studio_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          instagram: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          studio_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          instagram?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      client_deliveries: {
        Row: {
          id: string;
          studio_id: string;
          client_id: string;
          appointment_id: string | null;
          token: string;
          title: string;
          message: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          studio_id: string;
          client_id: string;
          appointment_id?: string | null;
          token?: string;
          title?: string;
          message?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["client_deliveries"]["Insert"]>;
        Relationships: [];
      };
      client_delivery_photos: {
        Row: {
          id: string;
          delivery_id: string;
          studio_id: string;
          url: string;
          file_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          delivery_id: string;
          studio_id: string;
          url: string;
          file_name?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["client_delivery_photos"]["Insert"]>;
        Relationships: [];
      };
      gallery: {
        Row: {
          id: string;
          studio_id: string;
          artist_id: string | null;
          url: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          studio_id: string;
          artist_id?: string | null;
          url: string;
          type?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gallery"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          studio_id: string;
          appointment_id: string | null;
          amount: number;
          type: string | null;
          method: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          studio_id: string;
          appointment_id?: string | null;
          amount: number;
          type?: string | null;
          method?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      payment_commissions: {
        Row: {
          id: string;
          studio_id: string;
          payment_id: string;
          appointment_id: string | null;
          artist_id: string;
          rule_id: string | null;
          client_source: string;
          base_amount: number;
          percentage: number;
          raw_commission_amount: number;
          commission_amount: number;
          cap_consumed_amount: number;
          cap_applied: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          studio_id: string;
          payment_id: string;
          appointment_id?: string | null;
          artist_id: string;
          rule_id?: string | null;
          client_source: string;
          base_amount?: number;
          percentage?: number;
          raw_commission_amount?: number;
          commission_amount?: number;
          cap_consumed_amount?: number;
          cap_applied?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payment_commissions"]["Insert"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          studio_id: string;
          client_name: string | null;
          rating: number | null;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          studio_id: string;
          client_name?: string | null;
          rating?: number | null;
          comment?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          studio_id: string;
          name: string;
          description: string | null;
          starting_price: number | null;
          avg_duration_minutes: number | null;
          category: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          studio_id: string;
          name: string;
          description?: string | null;
          starting_price?: number | null;
          avg_duration_minutes?: number | null;
          category?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      artist_commission_rules: {
        Row: {
          id: string;
          studio_id: string;
          artist_id: string;
          is_active: boolean;
          percentage: number;
          cap_enabled: boolean;
          monthly_cap: number | null;
          starts_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          studio_id: string;
          artist_id: string;
          is_active?: boolean;
          percentage?: number;
          cap_enabled?: boolean;
          monthly_cap?: number | null;
          starts_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["artist_commission_rules"]["Insert"]>;
        Relationships: [];
      };
      studios: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          instagram: string | null;
          whatsapp: string | null;
          website: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          instagram?: string | null;
          whatsapp?: string | null;
          website?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["studios"]["Insert"]>;
        Relationships: [];
      };
      tattoo_artists: {
        Row: {
          id: string;
          studio_id: string;
          name: string;
          slug: string;
          photo_url: string | null;
          specialty: string | null;
          bio: string | null;
          instagram: string | null;
          whatsapp: string | null;
          access_email: string | null;
          auth_user_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          studio_id: string;
          name: string;
          slug: string;
          photo_url?: string | null;
          specialty?: string | null;
          bio?: string | null;
          instagram?: string | null;
          whatsapp?: string | null;
          access_email?: string | null;
          auth_user_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tattoo_artists"]["Insert"]>;
        Relationships: [];
      };
      working_hours: {
        Row: {
          id: string;
          studio_id: string;
          day_of_week: number;
          open_time: string | null;
          close_time: string | null;
          is_open: boolean;
        };
        Insert: {
          id?: string;
          studio_id: string;
          day_of_week: number;
          open_time?: string | null;
          close_time?: string | null;
          is_open?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["working_hours"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_artist_id: {
        Args: {
          p_studio_id: string;
        };
        Returns: string | null;
      };
      current_user_can_view_client: {
        Args: {
          p_studio_id: string;
          p_client_id: string;
        };
        Returns: boolean;
      };
      current_user_can_view_delivery: {
        Args: {
          p_studio_id: string;
          p_appointment_id: string;
        };
        Returns: boolean;
      };
      current_user_is_artist_for_appointment: {
        Args: {
          p_studio_id: string;
          p_artist_id: string;
        };
        Returns: boolean;
      };
      get_booked_appointment_times: {
        Args: {
          p_studio_id: string;
          p_artist_id: string;
          p_date: string;
        };
        Returns: {
          booked_time: string;
        }[];
      };
      update_public_appointment_notes: {
        Args: {
          p_appointment_id: string;
          p_notes: string;
        };
        Returns: undefined;
      };
      get_client_delivery_by_token: {
        Args: {
          p_token: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
