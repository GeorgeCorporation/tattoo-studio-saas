export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          studio_id: string;
          artist_id: string | null;
          client_id: string | null;
          service_id: string | null;
          date: string;
          time: string;
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
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
