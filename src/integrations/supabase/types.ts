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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      account_request_history: {
        Row: {
          acted_by: string | null
          action: string
          created_at: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          acted_by?: string | null
          action: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          acted_by?: string | null
          action?: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_grants: {
        Row: {
          granted_at: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          user_id: string
        }
        Update: {
          granted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_assistant_conversations: {
        Row: {
          created_at: string
          id: string
          selected_car_id: string | null
          selected_car_name: string | null
          selected_month: number | null
          selected_year: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          selected_car_id?: string | null
          selected_car_name?: string | null
          selected_month?: number | null
          selected_year?: number | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          selected_car_id?: string | null
          selected_car_name?: string | null
          selected_month?: number | null
          selected_year?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_assistant_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_assistant_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "analytics_assistant_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_name: string
          category: string
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string
          category?: string
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          category?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      car_access: {
        Row: {
          car_id: string
          created_at: string
          granted_by: string
          id: string
          permission: string
          updated_at: string
          user_id: string
        }
        Insert: {
          car_id: string
          created_at?: string
          granted_by: string
          id?: string
          permission?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          car_id?: string
          created_at?: string
          granted_by?: string
          id?: string
          permission?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_access_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          client_id: string | null
          color: string | null
          created_at: string
          description: string | null
          host_id: string | null
          id: string
          images: string[] | null
          license_plate: string | null
          location: string | null
          make: string
          mileage: number | null
          model: string
          nickname: string | null
          status: string
          updated_at: string
          vin_number: string | null
          year: number
        }
        Insert: {
          client_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          host_id?: string | null
          id?: string
          images?: string[] | null
          license_plate?: string | null
          location?: string | null
          make: string
          mileage?: number | null
          model: string
          nickname?: string | null
          status?: string
          updated_at?: string
          vin_number?: string | null
          year: number
        }
        Update: {
          client_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          host_id?: string | null
          id?: string
          images?: string[] | null
          license_plate?: string | null
          location?: string | null
          make?: string
          mileage?: number | null
          model?: string
          nickname?: string | null
          status?: string
          updated_at?: string
          vin_number?: string | null
          year?: number
        }
        Relationships: []
      }
      client_car_expenses: {
        Row: {
          amount: number
          car_id: string
          client_id: string
          created_at: string
          end_date: string | null
          expense_type: string
          frequency: string
          id: string
          notes: string | null
          policy_number: string | null
          provider_name: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          car_id: string
          client_id: string
          created_at?: string
          end_date?: string | null
          expense_type: string
          frequency?: string
          id?: string
          notes?: string | null
          policy_number?: string | null
          provider_name?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          car_id?: string
          client_id?: string
          created_at?: string
          end_date?: string | null
          expense_type?: string
          frequency?: string
          id?: string
          notes?: string | null
          policy_number?: string | null
          provider_name?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      deliverability_recommendations: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          is_resolved: boolean | null
          resolved_at: string | null
          severity: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          severity: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dns_records_validation: {
        Row: {
          actual_value: string | null
          created_at: string | null
          domain: string
          error_message: string | null
          expected_value: string | null
          id: string
          last_checked_at: string | null
          record_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          actual_value?: string | null
          created_at?: string | null
          domain?: string
          error_message?: string | null
          expected_value?: string | null
          id?: string
          last_checked_at?: string | null
          record_type: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          actual_value?: string | null
          created_at?: string | null
          domain?: string
          error_message?: string | null
          expected_value?: string | null
          id?: string
          last_checked_at?: string | null
          record_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_ab_assignments: {
        Row: {
          assigned_at: string
          clicked_at: string | null
          id: string
          opened_at: string | null
          queue_item_id: string | null
          sent_at: string | null
          test_id: string
          user_id: string
          variant_id: string
        }
        Insert: {
          assigned_at?: string
          clicked_at?: string | null
          id?: string
          opened_at?: string | null
          queue_item_id?: string | null
          sent_at?: string | null
          test_id: string
          user_id: string
          variant_id: string
        }
        Update: {
          assigned_at?: string
          clicked_at?: string | null
          id?: string
          opened_at?: string | null
          queue_item_id?: string | null
          sent_at?: string | null
          test_id?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_ab_assignments_queue_item_id_fkey"
            columns: ["queue_item_id"]
            isOneToOne: false
            referencedRelation: "welcome_email_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_ab_assignments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "email_ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_ab_assignments_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "email_ab_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_ab_events: {
        Row: {
          assignment_id: string
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_ab_events_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "email_ab_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      email_ab_tests: {
        Row: {
          completed_at: string | null
          confidence_level: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          min_sample_size: number
          name: string
          started_at: string | null
          status: string
          step_id: string
          test_type: string
          traffic_split: number
          updated_at: string
          winner_metric: string | null
          winner_variant_id: string | null
        }
        Insert: {
          completed_at?: string | null
          confidence_level?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          min_sample_size?: number
          name: string
          started_at?: string | null
          status?: string
          step_id: string
          test_type?: string
          traffic_split?: number
          updated_at?: string
          winner_metric?: string | null
          winner_variant_id?: string | null
        }
        Update: {
          completed_at?: string | null
          confidence_level?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          min_sample_size?: number
          name?: string
          started_at?: string | null
          status?: string
          step_id?: string
          test_type?: string
          traffic_split?: number
          updated_at?: string
          winner_metric?: string | null
          winner_variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_ab_tests_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "welcome_email_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      email_ab_variants: {
        Row: {
          click_rate: number | null
          clicks_count: number
          combined_score: number | null
          created_at: string
          html_content: string
          id: string
          is_control: boolean
          name: string
          open_rate: number | null
          opens_count: number
          send_delay_hours: number | null
          sends_count: number
          subject: string
          test_id: string
          traffic_allocation: number
          updated_at: string
        }
        Insert: {
          click_rate?: number | null
          clicks_count?: number
          combined_score?: number | null
          created_at?: string
          html_content: string
          id?: string
          is_control?: boolean
          name: string
          open_rate?: number | null
          opens_count?: number
          send_delay_hours?: number | null
          sends_count?: number
          subject: string
          test_id: string
          traffic_allocation?: number
          updated_at?: string
        }
        Update: {
          click_rate?: number | null
          clicks_count?: number
          combined_score?: number | null
          created_at?: string
          html_content?: string
          id?: string
          is_control?: boolean
          name?: string
          open_rate?: number | null
          opens_count?: number
          send_delay_hours?: number | null
          sends_count?: number
          subject?: string
          test_id?: string
          traffic_allocation?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_ab_variants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "email_ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      email_bounce_events: {
        Row: {
          bounce_reason: string | null
          bounce_type: string
          campaign_id: string | null
          created_at: string | null
          email: string
          id: string
          user_id: string | null
        }
        Insert: {
          bounce_reason?: string | null
          bounce_type: string
          campaign_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          user_id?: string | null
        }
        Update: {
          bounce_reason?: string | null
          bounce_type?: string
          campaign_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_deliverability_metrics: {
        Row: {
          bounce_rate: number | null
          click_rate: number | null
          clicks: number | null
          created_at: string | null
          date: string
          delivery_rate: number | null
          hard_bounces: number | null
          id: string
          open_rate: number | null
          opens: number | null
          soft_bounces: number | null
          spam_complaints: number | null
          spam_rate: number | null
          total_bounced: number | null
          total_delivered: number | null
          total_sent: number | null
          unsubscribes: number | null
          updated_at: string | null
        }
        Insert: {
          bounce_rate?: number | null
          click_rate?: number | null
          clicks?: number | null
          created_at?: string | null
          date?: string
          delivery_rate?: number | null
          hard_bounces?: number | null
          id?: string
          open_rate?: number | null
          opens?: number | null
          soft_bounces?: number | null
          spam_complaints?: number | null
          spam_rate?: number | null
          total_bounced?: number | null
          total_delivered?: number | null
          total_sent?: number | null
          unsubscribes?: number | null
          updated_at?: string | null
        }
        Update: {
          bounce_rate?: number | null
          click_rate?: number | null
          clicks?: number | null
          created_at?: string | null
          date?: string
          delivery_rate?: number | null
          hard_bounces?: number | null
          id?: string
          open_rate?: number | null
          opens?: number | null
          soft_bounces?: number | null
          spam_complaints?: number | null
          spam_rate?: number | null
          total_bounced?: number | null
          total_delivered?: number | null
          total_sent?: number | null
          unsubscribes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_spam_complaints: {
        Row: {
          campaign_id: string | null
          complaint_type: string | null
          created_at: string | null
          email: string
          feedback_type: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          complaint_type?: string | null
          created_at?: string | null
          email: string
          feedback_type?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          complaint_type?: string | null
          created_at?: string | null
          email?: string
          feedback_type?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_template_gallery: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          html_content: string
          id: string
          industry: string
          is_featured: boolean | null
          name: string
          preview_image: string | null
          rating: number | null
          subject: string
          tags: string[] | null
          thumbnail_image: string | null
          updated_at: string
          use_count: number | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content: string
          id?: string
          industry: string
          is_featured?: boolean | null
          name: string
          preview_image?: string | null
          rating?: number | null
          subject: string
          tags?: string[] | null
          thumbnail_image?: string | null
          updated_at?: string
          use_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content?: string
          id?: string
          industry?: string
          is_featured?: boolean | null
          name?: string
          preview_image?: string | null
          rating?: number | null
          subject?: string
          tags?: string[] | null
          thumbnail_image?: string | null
          updated_at?: string
          use_count?: number | null
        }
        Relationships: []
      }
      host_audit_log: {
        Row: {
          action: string
          car_id: string | null
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          host_id: string
          id: string
        }
        Insert: {
          action: string
          car_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          host_id: string
          id?: string
        }
        Update: {
          action?: string
          car_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          host_id?: string
          id?: string
        }
        Relationships: []
      }
      host_claims: {
        Row: {
          accident_description: string | null
          car_id: string
          claim_amount: number | null
          claim_number: string | null
          claim_status: string
          claim_type: string
          created_at: string
          description: string
          guest_name: string | null
          host_id: string
          id: string
          incident_date: string
          incident_id: string | null
          is_paid: boolean
          payment_source: string | null
          photos_taken: boolean | null
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          accident_description?: string | null
          car_id: string
          claim_amount?: number | null
          claim_number?: string | null
          claim_status?: string
          claim_type: string
          created_at?: string
          description: string
          guest_name?: string | null
          host_id: string
          id?: string
          incident_date: string
          incident_id?: string | null
          is_paid?: boolean
          payment_source?: string | null
          photos_taken?: boolean | null
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          accident_description?: string | null
          car_id?: string
          claim_amount?: number | null
          claim_number?: string | null
          claim_status?: string
          claim_type?: string
          created_at?: string
          description?: string
          guest_name?: string | null
          host_id?: string
          id?: string
          incident_date?: string
          incident_id?: string | null
          is_paid?: boolean
          payment_source?: string | null
          photos_taken?: boolean | null
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_host_claims_car_id"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      host_earnings: {
        Row: {
          amount: number
          booking_id: string | null
          car_id: string
          client_profit_percentage: number | null
          commission: number | null
          created_at: string
          daily_rate: number | null
          date_paid: string | null
          delivery_address: string | null
          earning_period_end: string
          earning_period_start: string
          earning_type: string
          gross_earnings: number | null
          guest_name: string | null
          host_id: string
          host_profit_percentage: number | null
          id: string
          net_amount: number
          nights: number | null
          payment_date: string | null
          payment_source: string | null
          payment_status: string
          pickup_address: string | null
          return_address: string | null
          trip_id: string | null
          trip_idd: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          car_id: string
          client_profit_percentage?: number | null
          commission?: number | null
          created_at?: string
          daily_rate?: number | null
          date_paid?: string | null
          delivery_address?: string | null
          earning_period_end: string
          earning_period_start: string
          earning_type?: string
          gross_earnings?: number | null
          guest_name?: string | null
          host_id: string
          host_profit_percentage?: number | null
          id?: string
          net_amount: number
          nights?: number | null
          payment_date?: string | null
          payment_source?: string | null
          payment_status?: string
          pickup_address?: string | null
          return_address?: string | null
          trip_id?: string | null
          trip_idd?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          car_id?: string
          client_profit_percentage?: number | null
          commission?: number | null
          created_at?: string
          daily_rate?: number | null
          date_paid?: string | null
          delivery_address?: string | null
          earning_period_end?: string
          earning_period_start?: string
          earning_type?: string
          gross_earnings?: number | null
          guest_name?: string | null
          host_id?: string
          host_profit_percentage?: number | null
          id?: string
          net_amount?: number
          nights?: number | null
          payment_date?: string | null
          payment_source?: string | null
          payment_status?: string
          pickup_address?: string | null
          return_address?: string | null
          trip_id?: string | null
          trip_idd?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_host_earnings_car_id"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      host_earnings_guest_contact: {
        Row: {
          created_at: string
          earning_id: string
          guest_email: string | null
          guest_phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          earning_id: string
          guest_email?: string | null
          guest_phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          earning_id?: string
          guest_email?: string | null
          guest_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "host_earnings_guest_contact_earning_id_fkey"
            columns: ["earning_id"]
            isOneToOne: true
            referencedRelation: "client_visible_earnings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "host_earnings_guest_contact_earning_id_fkey"
            columns: ["earning_id"]
            isOneToOne: true
            referencedRelation: "host_earnings"
            referencedColumns: ["id"]
          },
        ]
      }
      host_expenses: {
        Row: {
          amount: number
          car_id: string | null
          carwash_cost: number | null
          created_at: string
          delivery_cost: number | null
          description: string | null
          ev_charge_cost: number | null
          expense_date: string
          expense_type: string
          guest_name: string | null
          host_id: string
          id: string
          receipt_url: string | null
          receipt_urls: string[] | null
          toll_cost: number | null
          total_expenses: number | null
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          car_id?: string | null
          carwash_cost?: number | null
          created_at?: string
          delivery_cost?: number | null
          description?: string | null
          ev_charge_cost?: number | null
          expense_date?: string
          expense_type: string
          guest_name?: string | null
          host_id: string
          id?: string
          receipt_url?: string | null
          receipt_urls?: string[] | null
          toll_cost?: number | null
          total_expenses?: number | null
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          car_id?: string | null
          carwash_cost?: number | null
          created_at?: string
          delivery_cost?: number | null
          description?: string | null
          ev_charge_cost?: number | null
          expense_date?: string
          expense_type?: string
          guest_name?: string | null
          host_id?: string
          id?: string
          receipt_url?: string | null
          receipt_urls?: string[] | null
          toll_cost?: number | null
          total_expenses?: number | null
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_host_expenses_car_id"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_inquiries: {
        Row: {
          car_count: number
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          status: string
          user_id: string
        }
        Insert: {
          car_count?: number
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          status?: string
          user_id: string
        }
        Update: {
          car_count?: number
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          investment_id: string
          method: Database["public"]["Enums"]["investment_payout_method"] | null
          notes: string | null
          paid_date: string | null
          payout_month: number
          reference: string | null
          scheduled_date: string
          status: Database["public"]["Enums"]["investment_payout_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          investment_id: string
          method?:
            | Database["public"]["Enums"]["investment_payout_method"]
            | null
          notes?: string | null
          paid_date?: string | null
          payout_month: number
          reference?: string | null
          scheduled_date: string
          status?: Database["public"]["Enums"]["investment_payout_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          investment_id?: string
          method?:
            | Database["public"]["Enums"]["investment_payout_method"]
            | null
          notes?: string | null
          paid_date?: string | null
          payout_month?: number
          reference?: string | null
          scheduled_date?: string
          status?: Database["public"]["Enums"]["investment_payout_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_payouts_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_resales: {
        Row: {
          created_at: string
          id: string
          investment_id: string
          investor_upside_amount: number
          method: Database["public"]["Enums"]["investment_payout_method"] | null
          notes: string | null
          paid_date: string | null
          payout_status: Database["public"]["Enums"]["investment_payout_status"]
          reference: string | null
          resale_date: string
          resale_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          investment_id: string
          investor_upside_amount?: number
          method?:
            | Database["public"]["Enums"]["investment_payout_method"]
            | null
          notes?: string | null
          paid_date?: string | null
          payout_status?: Database["public"]["Enums"]["investment_payout_status"]
          reference?: string | null
          resale_date: string
          resale_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          investment_id?: string
          investor_upside_amount?: number
          method?:
            | Database["public"]["Enums"]["investment_payout_method"]
            | null
          notes?: string | null
          paid_date?: string | null
          payout_status?: Database["public"]["Enums"]["investment_payout_status"]
          reference?: string | null
          resale_date?: string
          resale_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_resales_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount: number
          cancelled_at: string | null
          created_at: string
          end_date: string | null
          funded_at: string | null
          id: string
          investor_id: string
          monthly_return: number
          months_completed: number
          notes: string | null
          payment_method:
            | Database["public"]["Enums"]["investment_payout_method"]
            | null
          payment_reference: string | null
          requested_at: string
          resale_upside_pct: number
          start_date: string | null
          status: Database["public"]["Enums"]["investment_status"]
          term_months: number
          total_returns_paid: number
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          amount?: number
          cancelled_at?: string | null
          created_at?: string
          end_date?: string | null
          funded_at?: string | null
          id?: string
          investor_id: string
          monthly_return?: number
          months_completed?: number
          notes?: string | null
          payment_method?:
            | Database["public"]["Enums"]["investment_payout_method"]
            | null
          payment_reference?: string | null
          requested_at?: string
          resale_upside_pct?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["investment_status"]
          term_months?: number
          total_returns_paid?: number
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          amount?: number
          cancelled_at?: string | null
          created_at?: string
          end_date?: string | null
          funded_at?: string | null
          id?: string
          investor_id?: string
          monthly_return?: number
          months_completed?: number
          notes?: string | null
          payment_method?:
            | Database["public"]["Enums"]["investment_payout_method"]
            | null
          payment_reference?: string | null
          requested_at?: string
          resale_upside_pct?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["investment_status"]
          term_months?: number
          total_returns_paid?: number
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "investor_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_inquiries: {
        Row: {
          amount: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          amount?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      investor_payout_settings: {
        Row: {
          account_holder_name: string | null
          account_last4: string | null
          bank_name: string | null
          check_mailing_address: string | null
          created_at: string
          id: string
          investor_id: string
          notes: string | null
          preferred_method: Database["public"]["Enums"]["investor_payout_method"]
          routing_last4: string | null
          tax_address: string | null
          tax_full_name: string | null
          tax_id_last4: string | null
          updated_at: string
          zelle_handle: string | null
        }
        Insert: {
          account_holder_name?: string | null
          account_last4?: string | null
          bank_name?: string | null
          check_mailing_address?: string | null
          created_at?: string
          id?: string
          investor_id: string
          notes?: string | null
          preferred_method?: Database["public"]["Enums"]["investor_payout_method"]
          routing_last4?: string | null
          tax_address?: string | null
          tax_full_name?: string | null
          tax_id_last4?: string | null
          updated_at?: string
          zelle_handle?: string | null
        }
        Update: {
          account_holder_name?: string | null
          account_last4?: string | null
          bank_name?: string | null
          check_mailing_address?: string | null
          created_at?: string
          id?: string
          investor_id?: string
          notes?: string | null
          preferred_method?: Database["public"]["Enums"]["investor_payout_method"]
          routing_last4?: string | null
          tax_address?: string | null
          tax_full_name?: string | null
          tax_id_last4?: string | null
          updated_at?: string
          zelle_handle?: string | null
        }
        Relationships: []
      }
      investor_vehicles: {
        Row: {
          available_at: string
          color: string | null
          condition: string | null
          created_at: string
          description: string | null
          estimated_resale_value: number | null
          highlights: string[]
          id: string
          investment_amount: number
          location: string | null
          make: string
          mileage: number | null
          model: string
          monthly_return: number
          photos: string[]
          purchase_price: number
          resale_upside_pct: number
          status: Database["public"]["Enums"]["investor_vehicle_status"]
          term_months: number
          updated_at: string
          vin: string | null
          year: number
        }
        Insert: {
          available_at?: string
          color?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          estimated_resale_value?: number | null
          highlights?: string[]
          id?: string
          investment_amount?: number
          location?: string | null
          make?: string
          mileage?: number | null
          model: string
          monthly_return?: number
          photos?: string[]
          purchase_price?: number
          resale_upside_pct?: number
          status?: Database["public"]["Enums"]["investor_vehicle_status"]
          term_months?: number
          updated_at?: string
          vin?: string | null
          year: number
        }
        Update: {
          available_at?: string
          color?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          estimated_resale_value?: number | null
          highlights?: string[]
          id?: string
          investment_amount?: number
          location?: string | null
          make?: string
          mileage?: number | null
          model?: string
          monthly_return?: number
          photos?: string[]
          purchase_price?: number
          resale_upside_pct?: number
          status?: Database["public"]["Enums"]["investor_vehicle_status"]
          term_months?: number
          updated_at?: string
          vin?: string | null
          year?: number
        }
        Relationships: []
      }
      maintenance_schedules: {
        Row: {
          actual_cost: number | null
          car_id: string
          completion_date: string | null
          created_at: string
          estimated_cost: number | null
          host_id: string
          id: string
          maintenance_type: string
          notes: string | null
          provider_contact: string | null
          provider_name: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          car_id: string
          completion_date?: string | null
          created_at?: string
          estimated_cost?: number | null
          host_id: string
          id?: string
          maintenance_type: string
          notes?: string | null
          provider_contact?: string | null
          provider_name?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          car_id?: string
          completion_date?: string | null
          created_at?: string
          estimated_cost?: number | null
          host_id?: string
          id?: string
          maintenance_type?: string
          notes?: string | null
          provider_contact?: string | null
          provider_name?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_campaign_sends: {
        Row: {
          campaign_id: string
          created_at: string | null
          email: string
          error_message: string | null
          id: string
          sent_at: string | null
          status: string
          subscriber_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          email: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          subscriber_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          email?: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          subscriber_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_campaign_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_campaign_sends_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_campaigns: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          delivered_count: number | null
          failed_count: number | null
          id: string
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "newsletter_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          email: string
          id: string
          is_active: boolean
          source: string | null
          subscribed_at: string
          unsubscribe_token: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      newsletter_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          html_content: Json
          id: string
          is_default: boolean | null
          name: string
          preview_text: string | null
          subject_template: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content: Json
          id?: string
          is_default?: boolean | null
          name: string
          preview_text?: string | null
          subject_template: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          preview_text?: string | null
          subject_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          active_workspace: Database["public"]["Enums"]["workspace_role"]
          bio: string | null
          company_name: string | null
          created_at: string
          custom_client_profit_percentage: number | null
          custom_properties: Json | null
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          email: string | null
          first_name: string | null
          id: string
          is_subscribed: boolean
          is_super_admin: boolean
          landing_seen: Json
          last_login_at: string | null
          last_name: string | null
          location: string | null
          login_count: number | null
          phone: string
          profit_program: string | null
          promo_start_date: string | null
          rating: number | null
          rc_entitlements: Json | null
          rc_env: string | null
          rc_expiration_at: string | null
          rc_last_event_at: string | null
          rc_payload: Json | null
          rc_product_id: string | null
          rc_will_renew: boolean | null
          requested_at: string
          role: string
          services: string[] | null
          signup_metadata: Json | null
          signup_source: string | null
          tags: string[] | null
          turo_last_synced: string | null
          turo_profile_url: string | null
          turo_reviews_count: number | null
          updated_at: string
          user_id: string
          user_segment: string | null
        }
        Insert: {
          account_status?: string
          active_workspace?: Database["public"]["Enums"]["workspace_role"]
          bio?: string | null
          company_name?: string | null
          created_at?: string
          custom_client_profit_percentage?: number | null
          custom_properties?: Json | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_subscribed?: boolean
          is_super_admin?: boolean
          landing_seen?: Json
          last_login_at?: string | null
          last_name?: string | null
          location?: string | null
          login_count?: number | null
          phone: string
          profit_program?: string | null
          promo_start_date?: string | null
          rating?: number | null
          rc_entitlements?: Json | null
          rc_env?: string | null
          rc_expiration_at?: string | null
          rc_last_event_at?: string | null
          rc_payload?: Json | null
          rc_product_id?: string | null
          rc_will_renew?: boolean | null
          requested_at?: string
          role: string
          services?: string[] | null
          signup_metadata?: Json | null
          signup_source?: string | null
          tags?: string[] | null
          turo_last_synced?: string | null
          turo_profile_url?: string | null
          turo_reviews_count?: number | null
          updated_at?: string
          user_id: string
          user_segment?: string | null
        }
        Update: {
          account_status?: string
          active_workspace?: Database["public"]["Enums"]["workspace_role"]
          bio?: string | null
          company_name?: string | null
          created_at?: string
          custom_client_profit_percentage?: number | null
          custom_properties?: Json | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_subscribed?: boolean
          is_super_admin?: boolean
          landing_seen?: Json
          last_login_at?: string | null
          last_name?: string | null
          location?: string | null
          login_count?: number | null
          phone?: string
          profit_program?: string | null
          promo_start_date?: string | null
          rating?: number | null
          rc_entitlements?: Json | null
          rc_env?: string | null
          rc_expiration_at?: string | null
          rc_last_event_at?: string | null
          rc_payload?: Json | null
          rc_product_id?: string | null
          rc_will_renew?: boolean | null
          requested_at?: string
          role?: string
          services?: string[] | null
          signup_metadata?: Json | null
          signup_source?: string | null
          tags?: string[] | null
          turo_last_synced?: string | null
          turo_profile_url?: string | null
          turo_reviews_count?: number | null
          updated_at?: string
          user_id?: string
          user_segment?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          type: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
          type?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          type?: string
        }
        Relationships: []
      }
      push_devices: {
        Row: {
          created_at: string
          id: string
          muted: boolean
          platform: string
          revoked_at: string | null
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          muted?: boolean
          platform: string
          revoked_at?: string | null
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          muted?: boolean
          platform?: string
          revoked_at?: string | null
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          device: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          device?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          device?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          car_id: string
          client_id: string
          created_at: string
          host_id: string
          id: string
          message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          car_id: string
          client_id: string
          created_at?: string
          host_id: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          car_id?: string
          client_id?: string
          created_at?: string
          host_id?: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          car_id: string
          created_at: string
          daily_rate: number
          end_date: string
          guest_name: string
          host_id: string
          id: string
          notes: string | null
          payment_source: string | null
          start_date: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          car_id: string
          created_at?: string
          daily_rate?: number
          end_date: string
          guest_name: string
          host_id: string
          id?: string
          notes?: string | null
          payment_source?: string | null
          start_date: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          car_id?: string
          created_at?: string
          daily_rate?: number
          end_date?: string
          guest_name?: string
          host_id?: string
          id?: string
          notes?: string | null
          payment_source?: string | null
          start_date?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      signed_agreements: {
        Row: {
          agreement_version: string
          car_id: string
          id: string
          ip_address: string | null
          signed_at: string
          signer_name: string
          user_id: string
        }
        Insert: {
          agreement_version?: string
          car_id: string
          id?: string
          ip_address?: string | null
          signed_at?: string
          signer_name: string
          user_id: string
        }
        Update: {
          agreement_version?: string
          car_id?: string
          id?: string
          ip_address?: string | null
          signed_at?: string
          signer_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signed_agreements_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          activated_at: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          status: Database["public"]["Enums"]["workspace_role_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["workspace_role_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["workspace_role_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      welcome_email_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          scheduled_for: string
          sent_at: string | null
          sequence_id: string
          status: string
          step_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          scheduled_for: string
          sent_at?: string | null
          sequence_id: string
          status?: string
          step_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          sequence_id?: string
          status?: string
          step_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "welcome_email_queue_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "welcome_email_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "welcome_email_queue_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "welcome_email_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      welcome_email_sequences: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          target_role: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          target_role?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          target_role?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      welcome_email_steps: {
        Row: {
          created_at: string
          delay_days: number
          delay_hours: number
          html_content: string
          id: string
          sequence_id: string
          step_order: number
          subject: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          delay_days?: number
          delay_hours?: number
          html_content: string
          id?: string
          sequence_id: string
          step_order: number
          subject: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          delay_days?: number
          delay_hours?: number
          html_content?: string
          id?: string
          sequence_id?: string
          step_order?: number
          subject?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "welcome_email_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "welcome_email_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "welcome_email_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "newsletter_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      client_visible_earnings: {
        Row: {
          amount: number | null
          booking_id: string | null
          car_id: string | null
          client_profit_percentage: number | null
          commission: number | null
          created_at: string | null
          daily_rate: number | null
          date_paid: string | null
          delivery_address: string | null
          earning_period_end: string | null
          earning_period_start: string | null
          earning_type: string | null
          gross_earnings: number | null
          guest_initials: string | null
          host_id: string | null
          host_profit_percentage: number | null
          id: string | null
          net_amount: number | null
          nights: number | null
          payment_date: string | null
          payment_source: string | null
          payment_status: string | null
          pickup_address: string | null
          return_address: string | null
          trip_id: string | null
          trip_idd: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          booking_id?: string | null
          car_id?: string | null
          client_profit_percentage?: number | null
          commission?: number | null
          created_at?: string | null
          daily_rate?: number | null
          date_paid?: string | null
          delivery_address?: string | null
          earning_period_end?: string | null
          earning_period_start?: string | null
          earning_type?: string | null
          gross_earnings?: number | null
          guest_initials?: never
          host_id?: string | null
          host_profit_percentage?: number | null
          id?: string | null
          net_amount?: number | null
          nights?: number | null
          payment_date?: string | null
          payment_source?: string | null
          payment_status?: string | null
          pickup_address?: string | null
          return_address?: string | null
          trip_id?: string | null
          trip_idd?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          booking_id?: string | null
          car_id?: string | null
          client_profit_percentage?: number | null
          commission?: number | null
          created_at?: string | null
          daily_rate?: number | null
          date_paid?: string | null
          delivery_address?: string | null
          earning_period_end?: string | null
          earning_period_start?: string | null
          earning_type?: string | null
          gross_earnings?: number | null
          guest_initials?: never
          host_id?: string | null
          host_profit_percentage?: number | null
          id?: string | null
          net_amount?: number | null
          nights?: number | null
          payment_date?: string | null
          payment_source?: string | null
          payment_status?: string | null
          pickup_address?: string | null
          return_address?: string | null
          trip_id?: string | null
          trip_idd?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_host_earnings_car_id"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_hosting_request: { Args: { p_request_id: string }; Returns: Json }
      auto_select_winner: { Args: { p_test_id: string }; Returns: Json }
      get_car_earnings_summary: {
        Args: { p_car_id: string }
        Returns: {
          car_id: string
          last_earning_date: string
          pending_earnings_count: number
          total_owner_earnings: number
          total_trips: number
        }[]
      }
      get_clients_for_hosts: {
        Args: never
        Returns: {
          car_count: number
          company_name: string
          created_at: string
          email: string
          first_name: string
          has_cars: boolean
          hosted_car_count: number
          last_name: string
          phone: string
          user_id: string
        }[]
      }
      get_contact_info: {
        Args: { p_context: string; p_target_user_id: string }
        Returns: {
          company_name: string
          first_name: string
          masked_phone: string
          rating: number
          role: string
          user_id: string
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_emergency_contact: {
        Args: { p_target_user_id: string }
        Returns: {
          first_name: string
          phone: string
        }[]
      }
      get_host_claims_page: {
        Args: {
          p_car_id?: string
          p_claim_status?: string
          p_claim_type?: string
          p_date_from?: string
          p_date_to?: string
          p_incident_id?: string
          p_limit?: number
          p_offset?: number
          p_trip_search?: string
        }
        Returns: Json
      }
      get_host_contact_for_client: {
        Args: { p_car_id: string; p_client_id: string }
        Returns: {
          car_id: string
          host_company_name: string
          host_first_name: string
          host_id: string
          host_last_name: string
          host_location: string
          host_phone: string
          host_rating: number
          host_turo_profile_url: string
          host_turo_reviews_count: number
          make: string
          model: string
          status: string
          year: number
        }[]
      }
      get_host_contact_for_client_v2: {
        Args: { p_car_id: string; p_client_id: string }
        Returns: {
          car_id: string
          host_bio: string
          host_company_name: string
          host_first_name: string
          host_id: string
          host_last_name: string
          host_location: string
          host_phone: string
          host_rating: number
          host_services: string[]
          host_turo_profile_url: string
          host_turo_reviews_count: number
          make: string
          model: string
          status: string
          year: number
        }[]
      }
      get_host_earnings_page: {
        Args: {
          p_car_id?: string
          p_date_from?: string
          p_date_to?: string
          p_limit?: number
          p_offset?: number
          p_payment_source?: string
          p_payment_status?: string
          p_trip_search?: string
        }
        Returns: Json
      }
      get_host_expenses_page: {
        Args: {
          p_car_id?: string
          p_date_from?: string
          p_date_to?: string
          p_limit?: number
          p_offset?: number
          p_payment_source?: string
          p_trip_search?: string
        }
        Returns: Json
      }
      get_public_host_profiles: {
        Args: never
        Returns: {
          bio: string
          company_name: string
          first_name: string
          id: string
          last_name: string
          location: string
          rating: number
          services: string[]
          turo_profile_url: string
          turo_reviews_count: number
          user_id: string
        }[]
      }
      get_safe_car_info: {
        Args: { p_user_id?: string }
        Returns: {
          client_id: string
          color: string
          created_at: string
          description: string
          general_location: string
          host_id: string
          id: string
          images: string[]
          make: string
          mileage: number
          model: string
          status: string
          updated_at: string
          user_relationship: string
          year: number
        }[]
      }
      get_vehicle_identifiers_emergency: {
        Args: { p_car_id: string; p_purpose: string }
        Returns: {
          full_location: string
          masked_license_plate: string
          partial_vin: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["workspace_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_workspace_role: {
        Args: {
          _role: Database["public"]["Enums"]["workspace_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super: { Args: { uid: string }; Returns: boolean }
      reject_hosting_request: { Args: { p_request_id: string }; Returns: Json }
      update_user_profile:
        | {
            Args: {
              p_bio?: string
              p_company_name?: string
              p_first_name?: string
              p_last_name?: string
              p_location?: string
              p_phone?: string
              p_services?: string[]
              p_turo_profile_url?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_bio?: string
              p_company_name?: string
              p_first_name?: string
              p_last_name?: string
              p_location?: string
              p_phone?: string
              p_role?: string
              p_services?: string[]
              p_turo_profile_url?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_bio?: string
              p_company_name?: string
              p_first_name?: string
              p_last_name?: string
              p_location?: string
              p_phone?: string
              p_rating?: number
              p_role?: string
              p_services?: string[]
              p_turo_profile_url?: string
              p_turo_reviews_count?: number
            }
            Returns: Json
          }
    }
    Enums: {
      investment_payout_method: "ach" | "wire" | "check" | "zelle" | "other"
      investment_payout_status: "pending" | "scheduled" | "paid" | "skipped"
      investment_status:
        | "pending"
        | "active"
        | "completed"
        | "sold"
        | "cancelled"
      investor_payout_method: "ach" | "wire" | "check" | "zelle"
      investor_vehicle_status:
        | "draft"
        | "available"
        | "funded"
        | "active"
        | "sold"
        | "retired"
      workspace_role: "client" | "host" | "investor"
      workspace_role_status: "active" | "pending" | "suspended"
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
    Enums: {
      investment_payout_method: ["ach", "wire", "check", "zelle", "other"],
      investment_payout_status: ["pending", "scheduled", "paid", "skipped"],
      investment_status: [
        "pending",
        "active",
        "completed",
        "sold",
        "cancelled",
      ],
      investor_payout_method: ["ach", "wire", "check", "zelle"],
      investor_vehicle_status: [
        "draft",
        "available",
        "funded",
        "active",
        "sold",
        "retired",
      ],
      workspace_role: ["client", "host", "investor"],
      workspace_role_status: ["active", "pending", "suspended"],
    },
  },
} as const
