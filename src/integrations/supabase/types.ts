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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      extracted_data: {
        Row: {
          address: string | null
          agent_brokerage: string | null
          agent_email: string | null
          agent_license: string | null
          agent_name: string | null
          agent_phone: string | null
          bathrooms: number | null
          bedrooms: number | null
          bike_score: number | null
          created_at: string
          days_on_market: number | null
          elementary_school: string | null
          excel_url: string | null
          features: string[] | null
          high_school: string | null
          hoa_fees: string | null
          id: string
          insurance_cost: string | null
          json_url: string | null
          last_sold_date: string | null
          last_sold_price: string | null
          listing_date: string | null
          lot_size: string | null
          map_location_url: string | null
          middle_school: string | null
          mls_number: string | null
          nearby_amenities: string[] | null
          parking_info: string | null
          pdf_url: string | null
          price: string | null
          price_per_sqft: string | null
          property_description: string | null
          property_images: string[] | null
          property_tax: string | null
          property_type: string | null
          school_district: string | null
          square_footage: number | null
          task_id: string
          transit_score: number | null
          virtual_tour_url: string | null
          walk_score: number | null
          year_built: number | null
        }
        Insert: {
          address?: string | null
          agent_brokerage?: string | null
          agent_email?: string | null
          agent_license?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          bike_score?: number | null
          created_at?: string
          days_on_market?: number | null
          elementary_school?: string | null
          excel_url?: string | null
          features?: string[] | null
          high_school?: string | null
          hoa_fees?: string | null
          id?: string
          insurance_cost?: string | null
          json_url?: string | null
          last_sold_date?: string | null
          last_sold_price?: string | null
          listing_date?: string | null
          lot_size?: string | null
          map_location_url?: string | null
          middle_school?: string | null
          mls_number?: string | null
          nearby_amenities?: string[] | null
          parking_info?: string | null
          pdf_url?: string | null
          price?: string | null
          price_per_sqft?: string | null
          property_description?: string | null
          property_images?: string[] | null
          property_tax?: string | null
          property_type?: string | null
          school_district?: string | null
          square_footage?: number | null
          task_id: string
          transit_score?: number | null
          virtual_tour_url?: string | null
          walk_score?: number | null
          year_built?: number | null
        }
        Update: {
          address?: string | null
          agent_brokerage?: string | null
          agent_email?: string | null
          agent_license?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          bike_score?: number | null
          created_at?: string
          days_on_market?: number | null
          elementary_school?: string | null
          excel_url?: string | null
          features?: string[] | null
          high_school?: string | null
          hoa_fees?: string | null
          id?: string
          insurance_cost?: string | null
          json_url?: string | null
          last_sold_date?: string | null
          last_sold_price?: string | null
          listing_date?: string | null
          lot_size?: string | null
          map_location_url?: string | null
          middle_school?: string | null
          mls_number?: string | null
          nearby_amenities?: string[] | null
          parking_info?: string | null
          pdf_url?: string | null
          price?: string | null
          price_per_sqft?: string | null
          property_description?: string | null
          property_images?: string[] | null
          property_tax?: string | null
          property_type?: string | null
          school_district?: string | null
          square_footage?: number | null
          task_id?: string
          transit_score?: number | null
          virtual_tour_url?: string | null
          walk_score?: number | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_data_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          id: string
          progress: number
          source: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          progress?: number
          source: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          progress?: number
          source?: string
          status?: string
          type?: string
          updated_at?: string
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
