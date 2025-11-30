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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      billing_log: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          process_date: string
          process_type: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          process_date?: string
          process_type: string
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          process_date?: string
          process_type?: string
          status?: string
        }
        Relationships: []
      }
      breakdown_cost_centers: {
        Row: {
          budget: number | null
          city: string | null
          coords: string | null
          cost_id: string | null
          country: string | null
          description: string | null
          established: string | null
          full_address: string | null
          id: number
          manager: string | null
          manager_email: string | null
          manager_phone: string | null
          name: string | null
          state: string | null
          status: string
          street: string | null
        }
        Insert: {
          budget?: number | null
          city?: string | null
          coords?: string | null
          cost_id?: string | null
          country?: string | null
          description?: string | null
          established?: string | null
          full_address?: string | null
          id?: number
          manager?: string | null
          manager_email?: string | null
          manager_phone?: string | null
          name?: string | null
          state?: string | null
          status?: string
          street?: string | null
        }
        Update: {
          budget?: number | null
          city?: string | null
          coords?: string | null
          cost_id?: string | null
          country?: string | null
          description?: string | null
          established?: string | null
          full_address?: string | null
          id?: number
          manager?: string | null
          manager_email?: string | null
          manager_phone?: string | null
          name?: string | null
          state?: string | null
          status?: string
          street?: string | null
        }
        Relationships: []
      }
      client_quotes: {
        Row: {
          access_requirements: string | null
          account_id: string | null
          actual_cost: number | null
          actual_duration_hours: number | null
          after_photos: Json | null
          assigned_technician_id: string | null
          before_photos: Json | null
          completion_date: string | null
          completion_notes: string | null
          created_at: string | null
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_feedback: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_satisfaction_rating: number | null
          customer_signature_obtained: boolean | null
          documents: Json | null
          due_date: string | null
          end_time: string | null
          equipment_used: Json | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          id: string
          ip_address: string | null
          job_date: string | null
          job_description: string | null
          job_location: string | null
          job_number: string
          job_status: string | null
          job_type: string
          latitude: number | null
          longitude: number | null
          new_account_number: string | null
          odormeter: string | null
          parts_required: Json | null
          priority: string | null
          products_required: Json | null
          purchase_type: string | null
          qr_code: string | null
          quality_check_passed: boolean | null
          quotation_job_type: string | null
          quotation_number: string | null
          quotation_products: Json | null
          quotation_subtotal: number | null
          quotation_total_amount: number | null
          quotation_vat_amount: number | null
          quote_date: string | null
          quote_email_body: string | null
          quote_email_footer: string | null
          quote_email_subject: string | null
          quote_expiry_date: string | null
          quote_notes: string | null
          quote_status: string | null
          quote_type: string | null
          role: string | null
          safety_checklist_completed: boolean | null
          site_contact_person: string | null
          site_contact_phone: string | null
          special_instructions: string | null
          start_time: string | null
          status: string | null
          technician_name: string | null
          technician_phone: string | null
          temporary_registration: string | null
          updated_at: string | null
          updated_by: string | null
          vehicle_id: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_registration: string | null
          vehicle_year: number | null
          vin_number: string | null
          work_notes: string | null
        }
        Insert: {
          access_requirements?: string | null
          account_id?: string | null
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: Json | null
          assigned_technician_id?: string | null
          before_photos?: Json | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          customer_signature_obtained?: boolean | null
          documents?: Json | null
          due_date?: string | null
          end_time?: string | null
          equipment_used?: Json | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          ip_address?: string | null
          job_date?: string | null
          job_description?: string | null
          job_location?: string | null
          job_number: string
          job_status?: string | null
          job_type: string
          latitude?: number | null
          longitude?: number | null
          new_account_number?: string | null
          odormeter?: string | null
          parts_required?: Json | null
          priority?: string | null
          products_required?: Json | null
          purchase_type?: string | null
          qr_code?: string | null
          quality_check_passed?: boolean | null
          quotation_job_type?: string | null
          quotation_number?: string | null
          quotation_products?: Json | null
          quotation_subtotal?: number | null
          quotation_total_amount?: number | null
          quotation_vat_amount?: number | null
          quote_date?: string | null
          quote_email_body?: string | null
          quote_email_footer?: string | null
          quote_email_subject?: string | null
          quote_expiry_date?: string | null
          quote_notes?: string | null
          quote_status?: string | null
          quote_type?: string | null
          role?: string | null
          safety_checklist_completed?: boolean | null
          site_contact_person?: string | null
          site_contact_phone?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          technician_name?: string | null
          technician_phone?: string | null
          temporary_registration?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          vin_number?: string | null
          work_notes?: string | null
        }
        Update: {
          access_requirements?: string | null
          account_id?: string | null
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: Json | null
          assigned_technician_id?: string | null
          before_photos?: Json | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          customer_signature_obtained?: boolean | null
          documents?: Json | null
          due_date?: string | null
          end_time?: string | null
          equipment_used?: Json | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          ip_address?: string | null
          job_date?: string | null
          job_description?: string | null
          job_location?: string | null
          job_number?: string
          job_status?: string | null
          job_type?: string
          latitude?: number | null
          longitude?: number | null
          new_account_number?: string | null
          odormeter?: string | null
          parts_required?: Json | null
          priority?: string | null
          products_required?: Json | null
          purchase_type?: string | null
          qr_code?: string | null
          quality_check_passed?: boolean | null
          quotation_job_type?: string | null
          quotation_number?: string | null
          quotation_products?: Json | null
          quotation_subtotal?: number | null
          quotation_total_amount?: number | null
          quotation_vat_amount?: number | null
          quote_date?: string | null
          quote_email_body?: string | null
          quote_email_footer?: string | null
          quote_email_subject?: string | null
          quote_expiry_date?: string | null
          quote_notes?: string | null
          quote_status?: string | null
          quote_type?: string | null
          role?: string | null
          safety_checklist_completed?: boolean | null
          site_contact_person?: string | null
          site_contact_phone?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          technician_name?: string | null
          technician_phone?: string | null
          temporary_registration?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          vin_number?: string | null
          work_notes?: string | null
        }
        Relationships: []
      }
      client_stock: {
        Row: {
          code: string | null
          cost_excl_vat_zar: string | null
          created_at: string | null
          description: string | null
          id: number
          quantity: string | null
          stock_type: string | null
          supplier: string | null
          total_value: string | null
          USD: string | null
        }
        Insert: {
          code?: string | null
          cost_excl_vat_zar?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          quantity?: string | null
          stock_type?: string | null
          supplier?: string | null
          total_value?: string | null
          USD?: string | null
        }
        Update: {
          code?: string | null
          cost_excl_vat_zar?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          quantity?: string | null
          stock_type?: string | null
          supplier?: string | null
          total_value?: string | null
          USD?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          ck_number: string | null
          client_id: string | null
          contact_person: string | null
          coords: string | null
          country: string | null
          dropoff_locations: Json | null
          email: string | null
          id: number
          industry: string | null
          name: string
          phone: string | null
          pickup_locations: Json | null
          state: string | null
          status: string
          street: string | null
          tax_number: string | null
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          ck_number?: string | null
          client_id?: string | null
          contact_person?: string | null
          coords?: string | null
          country?: string | null
          dropoff_locations?: Json | null
          email?: string | null
          id?: number
          industry?: string | null
          name?: string
          phone?: string | null
          pickup_locations?: Json | null
          state?: string | null
          status?: string
          street?: string | null
          tax_number?: string | null
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          ck_number?: string | null
          client_id?: string | null
          contact_person?: string | null
          coords?: string | null
          country?: string | null
          dropoff_locations?: Json | null
          email?: string | null
          id?: number
          industry?: string | null
          name?: string
          phone?: string | null
          pickup_locations?: Json | null
          state?: string | null
          status?: string
          street?: string | null
          tax_number?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
      company: {
        Row: {
          company_contact: string | null
          company_contactname: string | null
          company_email: string | null
          company_fms: string | null
          company_industry: string | null
          company_infor: string | null
          company_name: string | null
          company_no_vehicles: number | null
          company_phone: string | null
          company_regions: string | null
          company_size: number | null
          company_tax_id: string | null
          company_v_type: string | null
          company_website: string | null
          created_at: string
          created_by: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          company_contact?: string | null
          company_contactname?: string | null
          company_email?: string | null
          company_fms?: string | null
          company_industry?: string | null
          company_infor?: string | null
          company_name?: string | null
          company_no_vehicles?: number | null
          company_phone?: string | null
          company_regions?: string | null
          company_size?: number | null
          company_tax_id?: string | null
          company_v_type?: string | null
          company_website?: string | null
          created_at?: string
          created_by?: string | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          company_contact?: string | null
          company_contactname?: string | null
          company_email?: string | null
          company_fms?: string | null
          company_industry?: string | null
          company_infor?: string | null
          company_name?: string | null
          company_no_vehicles?: number | null
          company_phone?: string | null
          company_regions?: string | null
          company_size?: number | null
          company_tax_id?: string | null
          company_v_type?: string | null
          company_website?: string | null
          created_at?: string
          created_by?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      cost_centers: {
        Row: {
          company: string | null
          cost_code: string | null
          created_at: string
          id: string
        }
        Insert: {
          company?: string | null
          cost_code?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          company?: string | null
          cost_code?: string | null
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      cust_quotes: {
        Row: {
          cash_discount: number
          cash_price: number
          created_at: string
          customer_address: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          description: string | null
          extra_notes: string | null
          id: string
          installation_discount: number
          installation_price: number | null
          job_type: string
          product_name: string | null
          quantity: number
          rental_discount: number
          rental_price: number
          selected_stock: string | null
          selected_vehicles: string | null
          status: string
          stock_received: string | null
          stock_type: string | null
          subtotal: number
          terms_conditions: string
          total_amount: number
          vat_amount: number
        }
        Insert: {
          cash_discount?: number
          cash_price?: number
          created_at?: string
          customer_address?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          description?: string | null
          extra_notes?: string | null
          id?: string
          installation_discount?: number
          installation_price?: number | null
          job_type: string
          product_name?: string | null
          quantity?: number
          rental_discount?: number
          rental_price?: number
          selected_stock?: string | null
          selected_vehicles?: string | null
          status?: string
          stock_received?: string | null
          stock_type?: string | null
          subtotal?: number
          terms_conditions?: string
          total_amount?: number
          vat_amount?: number
        }
        Update: {
          cash_discount?: number
          cash_price?: number
          created_at?: string
          customer_address?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          description?: string | null
          extra_notes?: string | null
          id?: string
          installation_discount?: number
          installation_price?: number | null
          job_type?: string
          product_name?: string | null
          quantity?: number
          rental_discount?: number
          rental_price?: number
          selected_stock?: string | null
          selected_vehicles?: string | null
          status?: string
          stock_received?: string | null
          stock_type?: string | null
          subtotal?: number
          terms_conditions?: string
          total_amount?: number
          vat_amount?: number
        }
        Relationships: []
      }
      customer_call_metrics: {
        Row: {
          avg_minutes: number | null
          avg_seconds: number | null
          created_at: string | null
          customer: string
          id: string
          max_minutes: number | null
          max_seconds: number | null
          min_minutes: number | null
          min_seconds: number | null
          stops: number | null
        }
        Insert: {
          avg_minutes?: number | null
          avg_seconds?: number | null
          created_at?: string | null
          customer: string
          id?: string
          max_minutes?: number | null
          max_seconds?: number | null
          min_minutes?: number | null
          min_seconds?: number | null
          stops?: number | null
        }
        Update: {
          avg_minutes?: number | null
          avg_seconds?: number | null
          created_at?: string | null
          customer?: string
          id?: string
          max_minutes?: number | null
          max_seconds?: number | null
          min_minutes?: number | null
          min_seconds?: number | null
          stops?: number | null
        }
        Relationships: []
      }
      customer_quotes: {
        Row: {
          access_requirements: string | null
          account_id: string | null
          actual_cost: number | null
          actual_duration_hours: number | null
          after_photos: Json | null
          assigned_technician_id: string | null
          before_photos: Json | null
          completion_date: string | null
          completion_notes: string | null
          created_at: string | null
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_feedback: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_satisfaction_rating: number | null
          customer_signature_obtained: boolean | null
          documents: Json | null
          due_date: string | null
          end_time: string | null
          equipment_used: Json | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          id: string
          ip_address: string | null
          job_date: string | null
          job_description: string | null
          job_location: string | null
          job_number: string
          job_status: string | null
          job_type: string
          latitude: number | null
          longitude: number | null
          new_account_number: string | null
          odormeter: string | null
          parts_required: Json | null
          priority: string | null
          products_required: Json | null
          purchase_type: string | null
          qr_code: string | null
          quality_check_passed: boolean | null
          quotation_job_type: string | null
          quotation_number: string | null
          quotation_products: Json | null
          quotation_subtotal: number | null
          quotation_total_amount: number | null
          quotation_vat_amount: number | null
          quote_date: string | null
          quote_email_body: string | null
          quote_email_footer: string | null
          quote_email_subject: string | null
          quote_expiry_date: string | null
          quote_notes: string | null
          quote_status: string | null
          quote_type: string | null
          role: string | null
          safety_checklist_completed: boolean | null
          site_contact_person: string | null
          site_contact_phone: string | null
          special_instructions: string | null
          start_time: string | null
          status: string | null
          technician_name: string | null
          technician_phone: string | null
          temporary_registration: string | null
          updated_at: string | null
          updated_by: string | null
          vehicle_id: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_registration: string | null
          vehicle_year: number | null
          vin_number: string | null
          work_notes: string | null
        }
        Insert: {
          access_requirements?: string | null
          account_id?: string | null
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: Json | null
          assigned_technician_id?: string | null
          before_photos?: Json | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          customer_signature_obtained?: boolean | null
          documents?: Json | null
          due_date?: string | null
          end_time?: string | null
          equipment_used?: Json | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          ip_address?: string | null
          job_date?: string | null
          job_description?: string | null
          job_location?: string | null
          job_number: string
          job_status?: string | null
          job_type: string
          latitude?: number | null
          longitude?: number | null
          new_account_number?: string | null
          odormeter?: string | null
          parts_required?: Json | null
          priority?: string | null
          products_required?: Json | null
          purchase_type?: string | null
          qr_code?: string | null
          quality_check_passed?: boolean | null
          quotation_job_type?: string | null
          quotation_number?: string | null
          quotation_products?: Json | null
          quotation_subtotal?: number | null
          quotation_total_amount?: number | null
          quotation_vat_amount?: number | null
          quote_date?: string | null
          quote_email_body?: string | null
          quote_email_footer?: string | null
          quote_email_subject?: string | null
          quote_expiry_date?: string | null
          quote_notes?: string | null
          quote_status?: string | null
          quote_type?: string | null
          role?: string | null
          safety_checklist_completed?: boolean | null
          site_contact_person?: string | null
          site_contact_phone?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          technician_name?: string | null
          technician_phone?: string | null
          temporary_registration?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          vin_number?: string | null
          work_notes?: string | null
        }
        Update: {
          access_requirements?: string | null
          account_id?: string | null
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: Json | null
          assigned_technician_id?: string | null
          before_photos?: Json | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          customer_signature_obtained?: boolean | null
          documents?: Json | null
          due_date?: string | null
          end_time?: string | null
          equipment_used?: Json | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          ip_address?: string | null
          job_date?: string | null
          job_description?: string | null
          job_location?: string | null
          job_number?: string
          job_status?: string | null
          job_type?: string
          latitude?: number | null
          longitude?: number | null
          new_account_number?: string | null
          odormeter?: string | null
          parts_required?: Json | null
          priority?: string | null
          products_required?: Json | null
          purchase_type?: string | null
          qr_code?: string | null
          quality_check_passed?: boolean | null
          quotation_job_type?: string | null
          quotation_number?: string | null
          quotation_products?: Json | null
          quotation_subtotal?: number | null
          quotation_total_amount?: number | null
          quotation_vat_amount?: number | null
          quote_date?: string | null
          quote_email_body?: string | null
          quote_email_footer?: string | null
          quote_email_subject?: string | null
          quote_expiry_date?: string | null
          quote_notes?: string | null
          quote_status?: string | null
          quote_type?: string | null
          role?: string | null
          safety_checklist_completed?: boolean | null
          site_contact_person?: string | null
          site_contact_phone?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          technician_name?: string | null
          technician_phone?: string | null
          temporary_registration?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          vin_number?: string | null
          work_notes?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          acc_contact: string | null
          account_number: string | null
          accounts_status: string | null
          annual_billing_run_date: string | null
          beame_list_name: string | null
          branch_person: string | null
          branch_person_email: string | null
          branch_person_number: string | null
          category: string | null
          cell_no: string | null
          company: string | null
          count_of_products: string | null
          created_at: string
          creator: string | null
          date_added: string | null
          date_modified: string | null
          divisions: string | null
          email: string | null
          holding_company: string | null
          id: number
          last_updated: string | null
          legal_name: string | null
          modified_by: string | null
          new_account_number: string | null
          payment_terms: string | null
          physical_address_1: string | null
          physical_address_2: string | null
          physical_address_3: string | null
          physical_area: string | null
          physical_code: string | null
          physical_country: string | null
          physical_province: string | null
          postal_address_1: string | null
          postal_address_2: string | null
          postal_area: string | null
          postal_code: string | null
          postal_country: string | null
          postal_province: string | null
          registration_number: string | null
          sales_rep: string | null
          send_accounts_to_contact: string | null
          send_accounts_to_email_for_statements_and_multibilling: string | null
          skylink_name: string | null
          switchboard: string | null
          trading_name: string | null
          vat_exempt_number: string | null
          vat_number: string | null
        }
        Insert: {
          acc_contact?: string | null
          account_number?: string | null
          accounts_status?: string | null
          annual_billing_run_date?: string | null
          beame_list_name?: string | null
          branch_person?: string | null
          branch_person_email?: string | null
          branch_person_number?: string | null
          category?: string | null
          cell_no?: string | null
          company?: string | null
          count_of_products?: string | null
          created_at?: string
          creator?: string | null
          date_added?: string | null
          date_modified?: string | null
          divisions?: string | null
          email?: string | null
          holding_company?: string | null
          id?: number
          last_updated?: string | null
          legal_name?: string | null
          modified_by?: string | null
          new_account_number?: string | null
          payment_terms?: string | null
          physical_address_1?: string | null
          physical_address_2?: string | null
          physical_address_3?: string | null
          physical_area?: string | null
          physical_code?: string | null
          physical_country?: string | null
          physical_province?: string | null
          postal_address_1?: string | null
          postal_address_2?: string | null
          postal_area?: string | null
          postal_code?: string | null
          postal_country?: string | null
          postal_province?: string | null
          registration_number?: string | null
          sales_rep?: string | null
          send_accounts_to_contact?: string | null
          send_accounts_to_email_for_statements_and_multibilling?: string | null
          skylink_name?: string | null
          switchboard?: string | null
          trading_name?: string | null
          vat_exempt_number?: string | null
          vat_number?: string | null
        }
        Update: {
          acc_contact?: string | null
          account_number?: string | null
          accounts_status?: string | null
          annual_billing_run_date?: string | null
          beame_list_name?: string | null
          branch_person?: string | null
          branch_person_email?: string | null
          branch_person_number?: string | null
          category?: string | null
          cell_no?: string | null
          company?: string | null
          count_of_products?: string | null
          created_at?: string
          creator?: string | null
          date_added?: string | null
          date_modified?: string | null
          divisions?: string | null
          email?: string | null
          holding_company?: string | null
          id?: number
          last_updated?: string | null
          legal_name?: string | null
          modified_by?: string | null
          new_account_number?: string | null
          payment_terms?: string | null
          physical_address_1?: string | null
          physical_address_2?: string | null
          physical_address_3?: string | null
          physical_area?: string | null
          physical_code?: string | null
          physical_country?: string | null
          physical_province?: string | null
          postal_address_1?: string | null
          postal_address_2?: string | null
          postal_area?: string | null
          postal_code?: string | null
          postal_country?: string | null
          postal_province?: string | null
          registration_number?: string | null
          sales_rep?: string | null
          send_accounts_to_contact?: string | null
          send_accounts_to_email_for_statements_and_multibilling?: string | null
          skylink_name?: string | null
          switchboard?: string | null
          trading_name?: string | null
          vat_exempt_number?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
      customers_grouped: {
        Row: {
          all_account_numbers: string | null
          all_new_account_numbers: string | null
          company_group: string | null
          cost_code: string | null
          created_at: string
          id: number
          legal_names: string | null
        }
        Insert: {
          all_account_numbers?: string | null
          all_new_account_numbers?: string | null
          company_group?: string | null
          cost_code?: string | null
          created_at?: string
          id?: never
          legal_names?: string | null
        }
        Update: {
          all_account_numbers?: string | null
          all_new_account_numbers?: string | null
          company_group?: string | null
          cost_code?: string | null
          created_at?: string
          id?: never
          legal_names?: string | null
        }
        Relationships: []
      }
      driver_vehicle_premiums: {
        Row: {
          adjusted_performance_rating: number
          adjusted_premium: number
          adjustment_amount: number
          adjustment_percentage: number
          base_premium: number
          created_at: string | null
          driver_id: string | null
          driver_name: string
          efficiency: number
          id: string
          is_low_performance: boolean
          month: number
          performance_rating: number
          plate: string
          safety_score: number
          tolerance_percentage: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          adjusted_performance_rating: number
          adjusted_premium: number
          adjustment_amount: number
          adjustment_percentage: number
          base_premium: number
          created_at?: string | null
          driver_id?: string | null
          driver_name: string
          efficiency: number
          id?: string
          is_low_performance?: boolean
          month: number
          performance_rating: number
          plate: string
          safety_score: number
          tolerance_percentage?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          adjusted_performance_rating?: number
          adjusted_premium?: number
          adjustment_amount?: number
          adjustment_percentage?: number
          base_premium?: number
          created_at?: string | null
          driver_id?: string | null
          driver_name?: string
          efficiency?: number
          id?: string
          is_low_performance?: boolean
          month?: number
          performance_rating?: number
          plate?: string
          safety_score?: number
          tolerance_percentage?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      drivers: {
        Row: {
          cell_number: string | null
          created_at: string | null
          created_by: string | null
          driver_restriction_code: string | null
          email_address: string | null
          first_name: string
          front_of_driver_pic: string | null
          id: number
          id_or_passport_document: string | null
          id_or_passport_number: string
          license_code: string | null
          license_expiry_date: string | null
          license_number: string | null
          pdp_expiry_date: string | null
          professional_driving_permit: boolean | null
          rear_of_driver_pic: string | null
          sa_issued: boolean | null
          surname: string
          user_id: string | null
          vehicle_restriction_code: string | null
          work_permit_upload: string | null
        }
        Insert: {
          cell_number?: string | null
          created_at?: string | null
          created_by?: string | null
          driver_restriction_code?: string | null
          email_address?: string | null
          first_name: string
          front_of_driver_pic?: string | null
          id?: number
          id_or_passport_document?: string | null
          id_or_passport_number: string
          license_code?: string | null
          license_expiry_date?: string | null
          license_number?: string | null
          pdp_expiry_date?: string | null
          professional_driving_permit?: boolean | null
          rear_of_driver_pic?: string | null
          sa_issued?: boolean | null
          surname: string
          user_id?: string | null
          vehicle_restriction_code?: string | null
          work_permit_upload?: string | null
        }
        Update: {
          cell_number?: string | null
          created_at?: string | null
          created_by?: string | null
          driver_restriction_code?: string | null
          email_address?: string | null
          first_name?: string
          front_of_driver_pic?: string | null
          id?: number
          id_or_passport_document?: string | null
          id_or_passport_number?: string
          license_code?: string | null
          license_expiry_date?: string | null
          license_number?: string | null
          pdp_expiry_date?: string | null
          professional_driving_permit?: boolean | null
          rear_of_driver_pic?: string | null
          sa_issued?: boolean | null
          surname?: string
          user_id?: string | null
          vehicle_restriction_code?: string | null
          work_permit_upload?: string | null
        }
        Relationships: []
      }
      eps_biweekly_category_points: {
        Row: {
          created_at: string | null
          day_driving_cap: number
          day_driving_earned: number
          driver_name: string
          harsh_braking_cap: number
          harsh_braking_earned: number
          haul_type: string
          id: number
          night_driving_cap: number
          night_driving_earned: number
          period_end: string
          period_start: string
          plate: string
          speed_compliance_cap: number
          speed_compliance_earned: number
          total_points_earned: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_driving_cap?: number
          day_driving_earned?: number
          driver_name: string
          harsh_braking_cap?: number
          harsh_braking_earned?: number
          haul_type: string
          id?: number
          night_driving_cap?: number
          night_driving_earned?: number
          period_end: string
          period_start: string
          plate: string
          speed_compliance_cap?: number
          speed_compliance_earned?: number
          total_points_earned?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_driving_cap?: number
          day_driving_earned?: number
          driver_name?: string
          harsh_braking_cap?: number
          harsh_braking_earned?: number
          haul_type?: string
          id?: number
          night_driving_cap?: number
          night_driving_earned?: number
          period_end?: string
          period_start?: string
          plate?: string
          speed_compliance_cap?: number
          speed_compliance_earned?: number
          total_points_earned?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      eps_daily_stats: {
        Row: {
          created_at: string | null
          date: string
          day_driving_hours: number | null
          driver_name: string
          first_drive_time: string | null
          id: number
          last_drive_time: string | null
          night_driving_hours: number | null
          night_driving_violations: number | null
          plate: string
          route_violations: number | null
          speed_violations: number | null
          total_distance: number | null
          total_driving_hours: number | null
          total_points: number | null
          total_violations: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          day_driving_hours?: number | null
          driver_name: string
          first_drive_time?: string | null
          id?: number
          last_drive_time?: string | null
          night_driving_hours?: number | null
          night_driving_violations?: number | null
          plate: string
          route_violations?: number | null
          speed_violations?: number | null
          total_distance?: number | null
          total_driving_hours?: number | null
          total_points?: number | null
          total_violations?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          day_driving_hours?: number | null
          driver_name?: string
          first_drive_time?: string | null
          id?: number
          last_drive_time?: string | null
          night_driving_hours?: number | null
          night_driving_violations?: number | null
          plate?: string
          route_violations?: number | null
          speed_violations?: number | null
          total_distance?: number | null
          total_driving_hours?: number | null
          total_points?: number | null
          total_violations?: number | null
        }
        Relationships: []
      }
      eps_driver_performance: {
        Row: {
          address: string | null
          created_at: string | null
          driver_name: string
          efficiency: number | null
          geozone: string | null
          id: number
          latitude: number | null
          loc_time: string
          longitude: number | null
          mileage: number | null
          plate: string
          reward_level: string | null
          route_compliance: boolean | null
          safety_score: number | null
          speed: number | null
          speed_compliance: boolean | null
          time_compliance: boolean | null
          total_points: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          driver_name: string
          efficiency?: number | null
          geozone?: string | null
          id?: number
          latitude?: number | null
          loc_time: string
          longitude?: number | null
          mileage?: number | null
          plate: string
          reward_level?: string | null
          route_compliance?: boolean | null
          safety_score?: number | null
          speed?: number | null
          speed_compliance?: boolean | null
          time_compliance?: boolean | null
          total_points?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          driver_name?: string
          efficiency?: number | null
          geozone?: string | null
          id?: number
          latitude?: number | null
          loc_time?: string
          longitude?: number | null
          mileage?: number | null
          plate?: string
          reward_level?: string | null
          route_compliance?: boolean | null
          safety_score?: number | null
          speed?: number | null
          speed_compliance?: boolean | null
          time_compliance?: boolean | null
          total_points?: number | null
        }
        Relationships: []
      }
      eps_driver_rewards: {
        Row: {
          created_at: string | null
          current_level: string | null
          driver_name: string
          id: number
          last_updated: string | null
          plate: string
          total_points: number | null
          violations_count: number | null
        }
        Insert: {
          created_at?: string | null
          current_level?: string | null
          driver_name: string
          id?: number
          last_updated?: string | null
          plate: string
          total_points?: number | null
          violations_count?: number | null
        }
        Update: {
          created_at?: string | null
          current_level?: string | null
          driver_name?: string
          id?: number
          last_updated?: string | null
          plate?: string
          total_points?: number | null
          violations_count?: number | null
        }
        Relationships: []
      }
      eps_driver_violations: {
        Row: {
          created_at: string | null
          driver_name: string
          id: number
          plate: string
          points: number | null
          severity: string
          threshold: string | null
          timestamp: string
          value: string | null
          violation_type: string
        }
        Insert: {
          created_at?: string | null
          driver_name: string
          id?: number
          plate: string
          points?: number | null
          severity: string
          threshold?: string | null
          timestamp: string
          value?: string | null
          violation_type: string
        }
        Update: {
          created_at?: string | null
          driver_name?: string
          id?: number
          plate?: string
          points?: number | null
          severity?: string
          threshold?: string | null
          timestamp?: string
          value?: string | null
          violation_type?: string
        }
        Relationships: []
      }
      eps_drivers: {
        Row: {
          additional_info: string | null
          address: string | null
          cell_number: string | null
          cellular: string | null
          code: string | null
          created_at: string
          driver_restriction_code: string | null
          driver_status: string | null
          email_address: string | null
          eps_validation: boolean | null
          first_name: string
          id: string
          identification_document_url: string | null
          identification_number: string | null
          is_active: boolean | null
          license_code: string | null
          license_expiry_date: string | null
          license_front_url: string | null
          license_number: string | null
          license_rear_url: string | null
          managed_code: string | null
          new_account_number: string
          pdp_expiry_date: string | null
          professional_driving_permit: boolean | null
          sa_issued: boolean | null
          surname: string
          updated_at: string
          vehicle_restriction_code: string | null
          work_permit_url: string | null
        }
        Insert: {
          additional_info?: string | null
          address?: string | null
          cell_number?: string | null
          cellular?: string | null
          code?: string | null
          created_at?: string
          driver_restriction_code?: string | null
          driver_status?: string | null
          email_address?: string | null
          eps_validation?: boolean | null
          first_name: string
          id?: string
          identification_document_url?: string | null
          identification_number?: string | null
          is_active?: boolean | null
          license_code?: string | null
          license_expiry_date?: string | null
          license_front_url?: string | null
          license_number?: string | null
          license_rear_url?: string | null
          managed_code?: string | null
          new_account_number?: string
          pdp_expiry_date?: string | null
          professional_driving_permit?: boolean | null
          sa_issued?: boolean | null
          surname: string
          updated_at?: string
          vehicle_restriction_code?: string | null
          work_permit_url?: string | null
        }
        Update: {
          additional_info?: string | null
          address?: string | null
          cell_number?: string | null
          cellular?: string | null
          code?: string | null
          created_at?: string
          driver_restriction_code?: string | null
          driver_status?: string | null
          email_address?: string | null
          eps_validation?: boolean | null
          first_name?: string
          id?: string
          identification_document_url?: string | null
          identification_number?: string | null
          is_active?: boolean | null
          license_code?: string | null
          license_expiry_date?: string | null
          license_front_url?: string | null
          license_number?: string | null
          license_rear_url?: string | null
          managed_code?: string | null
          new_account_number?: string
          pdp_expiry_date?: string | null
          professional_driving_permit?: boolean | null
          sa_issued?: boolean | null
          surname?: string
          updated_at?: string
          vehicle_restriction_code?: string | null
          work_permit_url?: string | null
        }
        Relationships: []
      }
      inspections: {
        Row: {
          category: string | null
          checklist: Json
          created_at: string | null
          driver_id: number | null
          id: number
          inspection_date: string | null
          odo_reading: number
          overall_status: string | null
          remarks: string | null
          vehicle_id: number
        }
        Insert: {
          category?: string | null
          checklist: Json
          created_at?: string | null
          driver_id?: number | null
          id?: number
          inspection_date?: string | null
          odo_reading: number
          overall_status?: string | null
          remarks?: string | null
          vehicle_id: number
        }
        Update: {
          category?: string | null
          checklist?: Json
          created_at?: string | null
          driver_id?: number | null
          id?: number
          inspection_date?: string | null
          odo_reading?: number
          overall_status?: string | null
          remarks?: string | null
          vehicle_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "inspections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehiclesc"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_summaries: {
        Row: {
          add_10_inflation: number
          claims_3_years: number
          combined_claims: number
          combined_monthly_premium: number
          created_at: string | null
          file_name: string | null
          id: string
          insurer_60_costs: number
          loss_ratio: number
          month: number
          monthly_premium: number
          monthly_premium_36_months: number
          processing_timestamp: string | null
          rate_applicable: number
          total_claim_inflation_costs: number
          total_claims_processed: number | null
          total_fleet_value: number
          trailer_claims: number
          trailer_excess: number
          trailer_fleet_value: number | null
          trailer_insurer_claim: number
          trailer_monthly_premium: number
          truck_claims: number
          truck_excess: number
          truck_fleet_value: number | null
          truck_insurer_claim: number
          truck_monthly_premium: number
          updated_at: string | null
          year: number
        }
        Insert: {
          add_10_inflation?: number
          claims_3_years?: number
          combined_claims?: number
          combined_monthly_premium?: number
          created_at?: string | null
          file_name?: string | null
          id?: string
          insurer_60_costs?: number
          loss_ratio?: number
          month: number
          monthly_premium?: number
          monthly_premium_36_months?: number
          processing_timestamp?: string | null
          rate_applicable?: number
          total_claim_inflation_costs?: number
          total_claims_processed?: number | null
          total_fleet_value?: number
          trailer_claims?: number
          trailer_excess?: number
          trailer_fleet_value?: number | null
          trailer_insurer_claim?: number
          trailer_monthly_premium?: number
          truck_claims?: number
          truck_excess?: number
          truck_fleet_value?: number | null
          truck_insurer_claim?: number
          truck_monthly_premium?: number
          updated_at?: string | null
          year: number
        }
        Update: {
          add_10_inflation?: number
          claims_3_years?: number
          combined_claims?: number
          combined_monthly_premium?: number
          created_at?: string | null
          file_name?: string | null
          id?: string
          insurer_60_costs?: number
          loss_ratio?: number
          month?: number
          monthly_premium?: number
          monthly_premium_36_months?: number
          processing_timestamp?: string | null
          rate_applicable?: number
          total_claim_inflation_costs?: number
          total_claims_processed?: number | null
          total_fleet_value?: number
          trailer_claims?: number
          trailer_excess?: number
          trailer_fleet_value?: number | null
          trailer_insurer_claim?: number
          trailer_monthly_premium?: number
          truck_claims?: number
          truck_excess?: number
          truck_fleet_value?: number | null
          truck_insurer_claim?: number
          truck_monthly_premium?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      inventory: {
        Row: {
          account_number: string | null
          comment: string | null
          company: string | null
          count: number | null
          group_name: string | null
          id: number
          ip_address: string | null
          new_registration: boolean | null
          product: string | null
          product_code: string | null
          soltrack: string | null
        }
        Insert: {
          account_number?: string | null
          comment?: string | null
          company?: string | null
          count?: number | null
          group_name?: string | null
          id?: number
          ip_address?: string | null
          new_registration?: boolean | null
          product?: string | null
          product_code?: string | null
          soltrack?: string | null
        }
        Update: {
          account_number?: string | null
          comment?: string | null
          company?: string | null
          count?: number | null
          group_name?: string | null
          id?: number
          ip_address?: string | null
          new_registration?: boolean | null
          product?: string | null
          product_code?: string | null
          soltrack?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          id: string
          invoice_id: string | null
          line_total: number
          product_id: string | null
          quantity: number
          unit_price: number
          vat_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          line_total: number
          product_id?: string | null
          quantity: number
          unit_price: number
          vat_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          line_total?: number
          product_id?: string | null
          quantity?: number
          unit_price?: number
          vat_amount?: number
        }
        Relationships: []
      }
      job_assignments: {
        Row: {
          accepted: boolean | null
          actual_cost: number | null
          approval_required: boolean | null
          approved_at: string | null
          approved_by: string | null
          assigned_technician: string | null
          attachments: string[] | null
          breakdown_req: boolean | null
          breakdowns_id: number | null
          client_name: string | null
          client_type: string | null
          completed_at: string | null
          coordinates: Json | null
          created_at: string | null
          created_by: string | null
          description: string
          driver_id: number | null
          emergency_type: string | null
          estimated_cost: number | null
          eta: string | null
          fleet_status: string | null
          id: number
          image_path: string | null
          inspected: boolean | null
          job_id: string | null
          job_status: string | null
          location: string | null
          notes: string | null
          order_no: string | null
          priority: string | null
          result_images: string[] | null
          scanned: boolean | null
          service: string | null
          status: string | null
          technician_id: number | null
          technician_phone: string | null
          updated_at: string | null
          updated_by: string | null
          vehicle_id: number | null
        }
        Insert: {
          accepted?: boolean | null
          actual_cost?: number | null
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_technician?: string | null
          attachments?: string[] | null
          breakdown_req?: boolean | null
          breakdowns_id?: number | null
          client_name?: string | null
          client_type?: string | null
          completed_at?: string | null
          coordinates?: Json | null
          created_at?: string | null
          created_by?: string | null
          description: string
          driver_id?: number | null
          emergency_type?: string | null
          estimated_cost?: number | null
          eta?: string | null
          fleet_status?: string | null
          id?: number
          image_path?: string | null
          inspected?: boolean | null
          job_id?: string | null
          job_status?: string | null
          location?: string | null
          notes?: string | null
          order_no?: string | null
          priority?: string | null
          result_images?: string[] | null
          scanned?: boolean | null
          service?: string | null
          status?: string | null
          technician_id?: number | null
          technician_phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: number | null
        }
        Update: {
          accepted?: boolean | null
          actual_cost?: number | null
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_technician?: string | null
          attachments?: string[] | null
          breakdown_req?: boolean | null
          breakdowns_id?: number | null
          client_name?: string | null
          client_type?: string | null
          completed_at?: string | null
          coordinates?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          driver_id?: number | null
          emergency_type?: string | null
          estimated_cost?: number | null
          eta?: string | null
          fleet_status?: string | null
          id?: number
          image_path?: string | null
          inspected?: boolean | null
          job_id?: string | null
          job_status?: string | null
          location?: string | null
          notes?: string | null
          order_no?: string | null
          priority?: string | null
          result_images?: string[] | null
          scanned?: boolean | null
          service?: string | null
          status?: string | null
          technician_id?: number | null
          technician_phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehiclesc"
            referencedColumns: ["id"]
          },
        ]
      }
      job_cards: {
        Row: {
          access_requirements: string | null
          account_id: string | null
          actual_cost: number | null
          actual_duration_hours: number | null
          after_photos: Json | null
          assigned_technician_id: string | null
          before_photos: Json | null
          completion_date: string | null
          completion_notes: string | null
          created_at: string | null
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_feedback: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_satisfaction_rating: number | null
          customer_signature_obtained: boolean | null
          documents: Json | null
          due_date: string | null
          end_time: string | null
          equipment_used: Json | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          id: string
          ip_address: string | null
          job_date: string | null
          job_description: string | null
          job_location: string | null
          job_number: string
          job_status: string | null
          job_type: string
          latitude: number | null
          longitude: number | null
          new_account_number: string | null
          odormeter: string | null
          parts_required: Json | null
          priority: string | null
          products_required: Json | null
          purchase_type: string | null
          qr_code: string | null
          quality_check_passed: boolean | null
          quotation_job_type: string | null
          quotation_number: string | null
          quotation_products: Json | null
          quotation_subtotal: number | null
          quotation_total_amount: number | null
          quotation_vat_amount: number | null
          quote_date: string | null
          quote_email_body: string | null
          quote_email_footer: string | null
          quote_email_subject: string | null
          quote_expiry_date: string | null
          quote_notes: string | null
          quote_status: string | null
          quote_type: string | null
          repair: boolean | null
          role: string | null
          safety_checklist_completed: boolean | null
          site_contact_person: string | null
          site_contact_phone: string | null
          special_instructions: string | null
          start_time: string | null
          status: string | null
          technician_name: string | null
          technician_phone: string | null
          temporary_registration: string | null
          updated_at: string | null
          updated_by: string | null
          vehicle_id: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_registration: string | null
          vehicle_year: number | null
          vin_numer: string | null
          work_notes: string | null
        }
        Insert: {
          access_requirements?: string | null
          account_id?: string | null
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: Json | null
          assigned_technician_id?: string | null
          before_photos?: Json | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          customer_signature_obtained?: boolean | null
          documents?: Json | null
          due_date?: string | null
          end_time?: string | null
          equipment_used?: Json | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          ip_address?: string | null
          job_date?: string | null
          job_description?: string | null
          job_location?: string | null
          job_number: string
          job_status?: string | null
          job_type: string
          latitude?: number | null
          longitude?: number | null
          new_account_number?: string | null
          odormeter?: string | null
          parts_required?: Json | null
          priority?: string | null
          products_required?: Json | null
          purchase_type?: string | null
          qr_code?: string | null
          quality_check_passed?: boolean | null
          quotation_job_type?: string | null
          quotation_number?: string | null
          quotation_products?: Json | null
          quotation_subtotal?: number | null
          quotation_total_amount?: number | null
          quotation_vat_amount?: number | null
          quote_date?: string | null
          quote_email_body?: string | null
          quote_email_footer?: string | null
          quote_email_subject?: string | null
          quote_expiry_date?: string | null
          quote_notes?: string | null
          quote_status?: string | null
          quote_type?: string | null
          repair?: boolean | null
          role?: string | null
          safety_checklist_completed?: boolean | null
          site_contact_person?: string | null
          site_contact_phone?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          technician_name?: string | null
          technician_phone?: string | null
          temporary_registration?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          vin_numer?: string | null
          work_notes?: string | null
        }
        Update: {
          access_requirements?: string | null
          account_id?: string | null
          actual_cost?: number | null
          actual_duration_hours?: number | null
          after_photos?: Json | null
          assigned_technician_id?: string | null
          before_photos?: Json | null
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          customer_signature_obtained?: boolean | null
          documents?: Json | null
          due_date?: string | null
          end_time?: string | null
          equipment_used?: Json | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          ip_address?: string | null
          job_date?: string | null
          job_description?: string | null
          job_location?: string | null
          job_number?: string
          job_status?: string | null
          job_type?: string
          latitude?: number | null
          longitude?: number | null
          new_account_number?: string | null
          odormeter?: string | null
          parts_required?: Json | null
          priority?: string | null
          products_required?: Json | null
          purchase_type?: string | null
          qr_code?: string | null
          quality_check_passed?: boolean | null
          quotation_job_type?: string | null
          quotation_number?: string | null
          quotation_products?: Json | null
          quotation_subtotal?: number | null
          quotation_total_amount?: number | null
          quotation_vat_amount?: number | null
          quote_date?: string | null
          quote_email_body?: string | null
          quote_email_footer?: string | null
          quote_email_subject?: string | null
          quote_expiry_date?: string | null
          quote_notes?: string | null
          quote_status?: string | null
          quote_type?: string | null
          repair?: boolean | null
          role?: string | null
          safety_checklist_completed?: boolean | null
          site_contact_person?: string | null
          site_contact_phone?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: string | null
          technician_name?: string | null
          technician_phone?: string | null
          temporary_registration?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vehicle_id?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_registration?: string | null
          vehicle_year?: number | null
          vin_numer?: string | null
          work_notes?: string | null
        }
        Relationships: []
      }
      late_vehicles: {
        Row: {
          account_number: string | null
          beame_1: string | null
          beame_2: string | null
          beame_3: string | null
          company: string | null
          id: number
          ip_address: string | null
          loan: boolean | null
          loan_return_date: string | null
          new_account_number: string
          plate: string | null
          reason: string | null
          return_time: string | null
          start_time: string | null
          status: string | null
        }
        Insert: {
          account_number?: string | null
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          id?: number
          ip_address?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          new_account_number: string
          plate?: string | null
          reason?: string | null
          return_time?: string | null
          start_time?: string | null
          status?: string | null
        }
        Update: {
          account_number?: string | null
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          id?: number
          ip_address?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          new_account_number?: string
          plate?: string | null
          reason?: string | null
          return_time?: string | null
          start_time?: string | null
          status?: string | null
        }
        Relationships: []
      }
      late_vehicles_reports: {
        Row: {
          beame_1: string | null
          beame_2: string | null
          beame_3: string | null
          company: string | null
          created_at: string | null
          id: number
          ip_address: string | null
          new_account_number: string
          plate: string | null
          reason: string | null
          return_time: string | null
          start_time: string | null
          status: string | null
        }
        Insert: {
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          created_at?: string | null
          id?: number
          ip_address?: string | null
          new_account_number: string
          plate?: string | null
          reason?: string | null
          return_time?: string | null
          start_time?: string | null
          status?: string | null
        }
        Update: {
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          created_at?: string | null
          id?: number
          ip_address?: string | null
          new_account_number?: string
          plate?: string | null
          reason?: string | null
          return_time?: string | null
          start_time?: string | null
          status?: string | null
        }
        Relationships: []
      }
      level_3_cost_centers: {
        Row: {
          branch: string | null
          company: string | null
          cost_code: string | null
          cost_codes: string | null
          created_at: string
          id: number
          new_account_number: string | null
          parent_cost_code: string | null
          sub_branch: string | null
          unique_id: string | null
        }
        Insert: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          cost_codes?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
          parent_cost_code?: string | null
          sub_branch?: string | null
          unique_id?: string | null
        }
        Update: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          cost_codes?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
          parent_cost_code?: string | null
          sub_branch?: string | null
          unique_id?: string | null
        }
        Relationships: []
      }
      level_4_cost_centers: {
        Row: {
          branch: string | null
          company: string | null
          cost_code: string | null
          cost_codes: string | null
          created_at: string
          id: number
          new_account_number: string | null
          parent_cost_code: string | null
          sub_branch: string | null
          unique_id: string | null
        }
        Insert: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          cost_codes?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
          parent_cost_code?: string | null
          sub_branch?: string | null
          unique_id?: string | null
        }
        Update: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          cost_codes?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
          parent_cost_code?: string | null
          sub_branch?: string | null
          unique_id?: string | null
        }
        Relationships: []
      }
      level_5_cost_centers: {
        Row: {
          branch: string | null
          company: string | null
          cost_code: string | null
          cost_codes: string | null
          created_at: string
          id: number
          new_account_number: string | null
          parent_cost_code: string | null
          sub_branch: string | null
          unique_id: string | null
        }
        Insert: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          cost_codes?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
          parent_cost_code?: string | null
          sub_branch?: string | null
          unique_id?: string | null
        }
        Update: {
          branch?: string | null
          company?: string | null
          cost_code?: string | null
          cost_codes?: string | null
          created_at?: string
          id?: number
          new_account_number?: string | null
          parent_cost_code?: string | null
          sub_branch?: string | null
          unique_id?: string | null
        }
        Relationships: []
      }
      live_vehicle_data: {
        Row: {
          account_number: string | null
          address: string | null
          beame_1: string | null
          beame_2: string | null
          beame_3: string | null
          company: string | null
          drivername: string | null
          geozone: string | null
          head: string | null
          id: number
          ip_address: string | null
          latitude: string | null
          loan: boolean | null
          loan_return_date: string | null
          loctime: string | null
          longitude: string | null
          mileage: string | null
          nameevent: string | null
          new_account_number: string
          plate: string | null
          pocsagstr: string | null
          quality: string | null
          speed: string | null
          temperature: string | null
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          drivername?: string | null
          geozone?: string | null
          head?: string | null
          id?: number
          ip_address?: string | null
          latitude?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          loctime?: string | null
          longitude?: string | null
          mileage?: string | null
          nameevent?: string | null
          new_account_number: string
          plate?: string | null
          pocsagstr?: string | null
          quality?: string | null
          speed?: string | null
          temperature?: string | null
        }
        Update: {
          account_number?: string | null
          address?: string | null
          beame_1?: string | null
          beame_2?: string | null
          beame_3?: string | null
          company?: string | null
          drivername?: string | null
          geozone?: string | null
          head?: string | null
          id?: number
          ip_address?: string | null
          latitude?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          loctime?: string | null
          longitude?: string | null
          mileage?: string | null
          nameevent?: string | null
          new_account_number?: string
          plate?: string | null
          pocsagstr?: string | null
          quality?: string | null
          speed?: string | null
          temperature?: string | null
        }
        Relationships: []
      }
      mac_steel: {
        Row: {
          company: string | null
          created_at: string
          entry_exit_points: Json | null
          exit_time: string | null
          geozone: string | null
          id: number
          new_account_number: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          entry_exit_points?: Json | null
          exit_time?: string | null
          geozone?: string | null
          id?: number
          new_account_number?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          entry_exit_points?: Json | null
          exit_time?: string | null
          geozone?: string | null
          id?: number
          new_account_number?: string | null
        }
        Relationships: []
      }
      monthly_fleet_stats: {
        Row: {
          average_performance_rating: number
          avg_km_per_day: number
          avg_km_per_trip: number
          avg_km_per_vehicle: number
          avg_trips_per_vehicle: number
          created_at: string | null
          harsh_acceleration_events: number
          harsh_braking_events: number
          id: string
          month: number
          night_driving_violations: number
          overall_risk_score: number
          speed_violations: number
          total_drivers: number
          total_driving_hours: number
          total_idle_time: number
          total_kilometres: number
          total_speeding_duration: number
          total_trips: number
          total_vehicles: number
          trips_over_5km: number
          updated_at: string | null
          vehicles_not_reporting: number
          vehicles_reporting: number
          year: number
        }
        Insert: {
          average_performance_rating?: number
          avg_km_per_day?: number
          avg_km_per_trip?: number
          avg_km_per_vehicle?: number
          avg_trips_per_vehicle?: number
          created_at?: string | null
          harsh_acceleration_events?: number
          harsh_braking_events?: number
          id?: string
          month: number
          night_driving_violations?: number
          overall_risk_score?: number
          speed_violations?: number
          total_drivers?: number
          total_driving_hours?: number
          total_idle_time?: number
          total_kilometres?: number
          total_speeding_duration?: number
          total_trips?: number
          total_vehicles?: number
          trips_over_5km?: number
          updated_at?: string | null
          vehicles_not_reporting?: number
          vehicles_reporting?: number
          year: number
        }
        Update: {
          average_performance_rating?: number
          avg_km_per_day?: number
          avg_km_per_trip?: number
          avg_km_per_vehicle?: number
          avg_trips_per_vehicle?: number
          created_at?: string | null
          harsh_acceleration_events?: number
          harsh_braking_events?: number
          id?: string
          month?: number
          night_driving_violations?: number
          overall_risk_score?: number
          speed_violations?: number
          total_drivers?: number
          total_driving_hours?: number
          total_idle_time?: number
          total_kilometres?: number
          total_speeding_duration?: number
          total_trips?: number
          total_vehicles?: number
          trips_over_5km?: number
          updated_at?: string | null
          vehicles_not_reporting?: number
          vehicles_reporting?: number
          year?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_due: number | null
          created_at: string
          due_date: string | null
          first_month: number | null
          id: number
          new_account_number: string | null
          overdue: number | null
          payment_reference: string | null
          second_month: number | null
          third_month: number | null
          total_amount: number | null
        }
        Insert: {
          amount_due?: number | null
          created_at?: string
          due_date?: string | null
          first_month?: number | null
          id?: number
          new_account_number?: string | null
          overdue?: number | null
          payment_reference?: string | null
          second_month?: number | null
          third_month?: number | null
          total_amount?: number | null
        }
        Update: {
          amount_due?: number | null
          created_at?: string
          due_date?: string | null
          first_month?: number | null
          id?: number
          new_account_number?: string | null
          overdue?: number | null
          payment_reference?: string | null
          second_month?: number | null
          third_month?: number | null
          total_amount?: number | null
        }
        Relationships: []
      }
      payments_: {
        Row: {
          balance_due: number | null
          billing_month: string | null
          company: string | null
          cost_code: string | null
          created_at: string
          due_amount: number | null
          due_date: string | null
          id: string
          invoice_date: string | null
          last_updated: string | null
          overdue_30_days: number | null
          overdue_60_days: number | null
          overdue_90_days: number | null
          paid_amount: number | null
          payment_status: string | null
          reference: string | null
        }
        Insert: {
          balance_due?: number | null
          billing_month?: string | null
          company?: string | null
          cost_code?: string | null
          created_at?: string
          due_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          last_updated?: string | null
          overdue_30_days?: number | null
          overdue_60_days?: number | null
          overdue_90_days?: number | null
          paid_amount?: number | null
          payment_status?: string | null
          reference?: string | null
        }
        Update: {
          balance_due?: number | null
          billing_month?: string | null
          company?: string | null
          cost_code?: string | null
          created_at?: string
          due_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          last_updated?: string | null
          overdue_30_days?: number | null
          overdue_60_days?: number | null
          overdue_90_days?: number | null
          paid_amount?: number | null
          payment_status?: string | null
          reference?: string | null
        }
        Relationships: []
      }
      product_items: {
        Row: {
          category: string
          description: string | null
          discount: number | null
          id: string
          installation: number | null
          price: number
          product: string
          quantity: number | null
          rental: number | null
          subscription: number | null
          type: string
        }
        Insert: {
          category: string
          description?: string | null
          discount?: number | null
          id?: string
          installation?: number | null
          price: number
          product: string
          quantity?: number | null
          rental?: number | null
          subscription?: number | null
          type: string
        }
        Update: {
          category?: string
          description?: string | null
          discount?: number | null
          id?: string
          installation?: number | null
          price?: number
          product?: string
          quantity?: number | null
          rental?: number | null
          subscription?: number | null
          type?: string
        }
        Relationships: []
      }
      quote_products: {
        Row: {
          cash_discount: number
          cash_price: number
          created_at: string
          date: string | null
          discount: number | null
          id: string
          installation_discount: number
          installation_price: number | null
          open: boolean | null
          parts_assigned: string[] | null
          product_name: string
          quantity: number
          quote_id: string
          rental_discount: number
          rental_price: number
          role: string | null
          subtotal: number
          technician: string | null
          time: string | null
          vehicle: string[] | null
        }
        Insert: {
          cash_discount?: number
          cash_price?: number
          created_at?: string
          date?: string | null
          discount?: number | null
          id?: string
          installation_discount?: number
          installation_price?: number | null
          open?: boolean | null
          parts_assigned?: string[] | null
          product_name: string
          quantity?: number
          quote_id: string
          rental_discount?: number
          rental_price?: number
          role?: string | null
          subtotal?: number
          technician?: string | null
          time?: string | null
          vehicle?: string[] | null
        }
        Update: {
          cash_discount?: number
          cash_price?: number
          created_at?: string
          date?: string | null
          discount?: number | null
          id?: string
          installation_discount?: number
          installation_price?: number | null
          open?: boolean | null
          parts_assigned?: string[] | null
          product_name?: string
          quantity?: number
          quote_id?: string
          rental_discount?: number
          rental_price?: number
          role?: string | null
          subtotal?: number
          technician?: string | null
          time?: string | null
          vehicle?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_products_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "cust_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_jobs: {
        Row: {
          created_at: string
          custome_email: string | null
          customer_name: string | null
          id: number
          notes: string | null
        }
        Insert: {
          created_at?: string
          custome_email?: string | null
          customer_name?: string | null
          id?: number
          notes?: string | null
        }
        Update: {
          created_at?: string
          custome_email?: string | null
          customer_name?: string | null
          id?: number
          notes?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          account_number: string | null
          created_at: string
          daily: boolean | null
          id: number
          loan: boolean | null
          loan_return_date: string | null
          month: string | null
          monthly: boolean | null
          new_account_number: string | null
          url: string | null
          weekly: boolean | null
        }
        Insert: {
          account_number?: string | null
          created_at?: string
          daily?: boolean | null
          id?: number
          loan?: boolean | null
          loan_return_date?: string | null
          month?: string | null
          monthly?: boolean | null
          new_account_number?: string | null
          url?: string | null
          weekly?: boolean | null
        }
        Update: {
          account_number?: string | null
          created_at?: string
          daily?: boolean | null
          id?: number
          loan?: boolean | null
          loan_return_date?: string | null
          month?: string | null
          monthly?: boolean | null
          new_account_number?: string | null
          url?: string | null
          weekly?: boolean | null
        }
        Relationships: []
      }
      stock: {
        Row: {
          code: string | null
          cost_excl_vat_zar: string | null
          created_at: string | null
          description: string | null
          id: number
          quantity: string | null
          stock_type: string | null
          supplier: string | null
          total_value: string | null
          USD: string | null
        }
        Insert: {
          code?: string | null
          cost_excl_vat_zar?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          quantity?: string | null
          stock_type?: string | null
          supplier?: string | null
          total_value?: string | null
          USD?: string | null
        }
        Update: {
          code?: string | null
          cost_excl_vat_zar?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          quantity?: string | null
          stock_type?: string | null
          supplier?: string | null
          total_value?: string | null
          USD?: string | null
        }
        Relationships: []
      }
      stock_orders: {
        Row: {
          approved: boolean | null
          created_at: string | null
          created_by: string | null
          id: number
          invoice_link: string | null
          notes: string | null
          order_date: string | null
          order_items: Json
          order_number: string
          status: string | null
          supplier: string | null
          total_amount_ex_vat: number
          total_amount_usd: number | null
          updated_at: string | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: number
          invoice_link?: string | null
          notes?: string | null
          order_date?: string | null
          order_items?: Json
          order_number: string
          status?: string | null
          supplier?: string | null
          total_amount_ex_vat: number
          total_amount_usd?: number | null
          updated_at?: string | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: number
          invoice_link?: string | null
          notes?: string | null
          order_date?: string | null
          order_items?: Json
          order_number?: string
          status?: string | null
          supplier?: string | null
          total_amount_ex_vat?: number
          total_amount_usd?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_payments: {
        Row: {
          amount: number | null
          created_at: string
          id: number
          order_number: string | null
          payment_reference: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: number
          order_number?: string | null
          payment_reference?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: number
          order_number?: string | null
          payment_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_payments_order_number_fkey"
            columns: ["order_number"]
            isOneToOne: false
            referencedRelation: "stock_orders"
            referencedColumns: ["order_number"]
          },
        ]
      }
      stock_pricing: {
        Row: {
          code: string | null
          cost_excl_vat_zar: string | null
          created_at: string | null
          description: string | null
          id: number
          stock_type: string | null
          supplier: string | null
          total_value: string | null
          USD: string | null
        }
        Insert: {
          code?: string | null
          cost_excl_vat_zar?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          stock_type?: string | null
          supplier?: string | null
          total_value?: string | null
          USD?: string | null
        }
        Update: {
          code?: string | null
          cost_excl_vat_zar?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          stock_type?: string | null
          supplier?: string | null
          total_value?: string | null
          USD?: string | null
        }
        Relationships: []
      }
      systems: {
        Row: {
          created_at: string
          id: number
          system_name: string | null
          system_url: string | null
          users: Json | null
        }
        Insert: {
          created_at?: string
          id?: number
          system_name?: string | null
          system_url?: string | null
          users?: Json | null
        }
        Update: {
          created_at?: string
          id?: number
          system_name?: string | null
          system_url?: string | null
          users?: Json | null
        }
        Relationships: []
      }
      technicians: {
        Row: {
          admin: boolean | null
          color_code: string | null
          created_at: string
          email: string | null
          id: number
          name: string | null
        }
        Insert: {
          admin?: boolean | null
          color_code?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          admin?: boolean | null
          color_code?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      trips: {
        Row: {
          cargo: string | null
          cargo_weight: string | null
          cargoWeight: number | null
          client_details: Json | null
          cost_centre: string | null
          destination: string | null
          distance: string | null
          driver: string | null
          drivers: Json | null
          dropoff_locations: Json | null
          end_date: string | null
          id: number
          notes: string | null
          order_number: string | null
          origin: string | null
          pickup_locations: Json | null
          rate: string | null
          route: string | null
          selected_client: string | null
          selected_stop_points: Json | null
          start_date: string | null
          status: string
          status_notes: string | null
          stop_points: Json | null
          trip_id: string
          vehicle: string | null
          vehicle_assignments: Json | null
          vehicles: Json | null
          waypoints: Json | null
        }
        Insert: {
          cargo?: string | null
          cargo_weight?: string | null
          cargoWeight?: number | null
          client_details?: Json | null
          cost_centre?: string | null
          destination?: string | null
          distance?: string | null
          driver?: string | null
          drivers?: Json | null
          dropoff_locations?: Json | null
          end_date?: string | null
          id?: number
          notes?: string | null
          order_number?: string | null
          origin?: string | null
          pickup_locations?: Json | null
          rate?: string | null
          route?: string | null
          selected_client?: string | null
          selected_stop_points?: Json | null
          start_date?: string | null
          status?: string
          status_notes?: string | null
          stop_points?: Json | null
          trip_id: string
          vehicle?: string | null
          vehicle_assignments?: Json | null
          vehicles?: Json | null
          waypoints?: Json | null
        }
        Update: {
          cargo?: string | null
          cargo_weight?: string | null
          cargoWeight?: number | null
          client_details?: Json | null
          cost_centre?: string | null
          destination?: string | null
          distance?: string | null
          driver?: string | null
          drivers?: Json | null
          dropoff_locations?: Json | null
          end_date?: string | null
          id?: number
          notes?: string | null
          order_number?: string | null
          origin?: string | null
          pickup_locations?: Json | null
          rate?: string | null
          route?: string | null
          selected_client?: string | null
          selected_stop_points?: Json | null
          start_date?: string | null
          status?: string
          status_notes?: string | null
          stop_points?: Json | null
          trip_id?: string
          vehicle?: string | null
          vehicle_assignments?: Json | null
          vehicles?: Json | null
          waypoints?: Json | null
        }
        Relationships: []
      }
      users: {
        Row: {
          company: string | null
          cost_code: string | null
          created_at: string
          email: string
          energyrite: boolean | null
          first_login: boolean | null
          id: string
          permissions: Json | null
          role: string | null
          tech_admin: boolean | null
        }
        Insert: {
          company?: string | null
          cost_code?: string | null
          created_at?: string
          email: string
          energyrite?: boolean | null
          first_login?: boolean | null
          id: string
          permissions?: Json | null
          role?: string | null
          tech_admin?: boolean | null
        }
        Update: {
          company?: string | null
          cost_code?: string | null
          created_at?: string
          email?: string
          energyrite?: boolean | null
          first_login?: boolean | null
          id?: string
          permissions?: Json | null
          role?: string | null
          tech_admin?: boolean | null
        }
        Relationships: []
      }
      vehicle_inspections: {
        Row: {
          created_at: string | null
          driver_id: number | null
          id: number
          inspected: boolean
          inspection_date: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: number | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: number | null
          id?: number
          inspected?: boolean
          inspection_date?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: number | null
        }
        Update: {
          created_at?: string | null
          driver_id?: number | null
          id?: number
          inspected?: boolean
          inspection_date?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehiclesc"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_invoices: {
        Row: {
          "2nd_month": number | null
          "3rd_month": number | null
          a2_dash_cam: string | null
          a2_dash_cam_rental: string | null
          a2_mec_5: string | null
          a2_mec_5_rental: string | null
          a3_dash_cam_ai: string | null
          a3_dash_cam_ai_rental: string | null
          account_number: string | null
          account_number_2: string | null
          active: boolean | null
          adas_02_road_facing: string | null
          adas_02_road_facing_rental: string | null
          after_hours: string | null
          amount_due: string | null
          beame: string | null
          beame_1_rental: string | null
          beame_1_sub: string | null
          beame_2: string | null
          beame_2_rental: string | null
          beame_2_sub: string | null
          beame_3: string | null
          beame_3_rental: string | null
          beame_3_sub: string | null
          beame_4: string | null
          beame_4_rental: string | null
          beame_4_sub: string | null
          beame_5: string | null
          beame_5_rental: string | null
          beame_5_sub: string | null
          breathaloc: string | null
          breathaloc_rental: string | null
          buzzer: string | null
          buzzer_rental: string | null
          cable_10m_for_camera_4pin: string | null
          cable_10m_for_camera_4pin_rental: string | null
          cable_5m_6pin: string | null
          cable_5m_6pin_rental: string | null
          cable_5m_for_camera_4pin: string | null
          cable_5m_for_camera_4pin_rental: string | null
          cia: string | null
          cia_rental: string | null
          colour: string | null
          company: string | null
          consultancy: string | null
          controlroom: string | null
          corpconnect_data_no: string | null
          corpconnect_sim_no: string | null
          data_number: string | null
          dms01_driver_facing: string | null
          dms01_driver_facing_rental: string | null
          doc_no: string | null
          dual_probe_rental: string | null
          dual_probe_sub: string | null
          early_warning: string | null
          early_warning_rental: string | null
          engine: string | null
          extension_cable_1m: string | null
          extension_cable_1m_rental: string | null
          extension_cable_3m: string | null
          extension_cable_3m_rental: string | null
          flat_panic: string | null
          flat_panic_rental: string | null
          fleet_number: string | null
          fm_unit: string | null
          fm_unit_rental: string | null
          fm_unit_sub: string | null
          fuel_probe_1: string | null
          fuel_probe_2: string | null
          gps: string | null
          gps_rental: string | null
          group_name: string | null
          gsm: string | null
          gsm_rental: string | null
          harness_7m_for_probe: string | null
          harness_7m_for_probe_rental: string | null
          id: number
          idata: string | null
          idata_rental: string | null
          industrial_panic: string | null
          industrial_panic_rental: string | null
          ip_address: string | null
          keypad: string | null
          keypad_rental: string | null
          keypad_waterproof: string | null
          loan: boolean | null
          loan_return_date: string | null
          main_fm_harness: string | null
          main_fm_harness_rental: string | null
          maintenance: string | null
          make: string | null
          mdvr_4ch: string | null
          mdvr_4ch_rental: string | null
          mdvr_4ch_sub: string | null
          mdvr_5ch: string | null
          mdvr_5ch_rental: string | null
          mdvr_5ch_sub: string | null
          mdvr_8ch: string | null
          mdvr_8ch_rental: string | null
          mdvr_8ch_sub: string | null
          mic: string | null
          mic_rental: string | null
          model: string | null
          new_account_number: string | null
          one_month: number | null
          pfk_10m: string | null
          pfk_10m_rental: string | null
          pfk_15m: string | null
          pfk_15m_rental: string | null
          pfk_20m: string | null
          pfk_20m_rental: string | null
          pfk_5m: string | null
          pfk_5m_rental: string | null
          pfk_corpconnect_data_number: string | null
          pfk_corpconnect_sim_number: string | null
          pfk_dome_1: string | null
          pfk_dome_1_rental: string | null
          pfk_dome_2: string | null
          pfk_dome_2_rental: string | null
          pfk_driver_facing: string | null
          pfk_driver_facing_rental: string | null
          pfk_main_unit: string | null
          pfk_main_unit_rental: string | null
          pfk_main_unit_sub: string | null
          pfk_road_facing: string | null
          pfk_road_facing_rental: string | null
          roaming: string | null
          roller_door_switches: string | null
          roller_door_switches_rental: string | null
          sd_card_1tb: string | null
          sd_card_1tb_rental: string | null
          sd_card_250gb: string | null
          sd_card_250gb_rental: string | null
          sd_card_256gb: string | null
          sd_card_256gb_rental: string | null
          sd_card_2tb: string | null
          sd_card_2tb_rental: string | null
          sd_card_480gb: string | null
          sd_card_480gb_rental: string | null
          sd_card_512gb: string | null
          sd_card_512gb_rental: string | null
          sim_card_number: string | null
          sim_id: string | null
          single_probe_rental: string | null
          single_probe_sub: string | null
          sky_ican: string | null
          sky_ican_rental: string | null
          sky_idata: string | null
          sky_idata_rental: string | null
          sky_on_batt_ign_rental: string | null
          sky_on_batt_ign_unit_ip: string | null
          sky_on_batt_ign_unit_serial_number: string | null
          sky_on_batt_sub: string | null
          sky_safety: string | null
          sky_scout_12v_ip: string | null
          sky_scout_12v_rental: string | null
          sky_scout_12v_serial_number: string | null
          sky_scout_12v_sub: string | null
          sky_scout_24v_ip: string | null
          sky_scout_24v_rental: string | null
          sky_scout_24v_serial_number: string | null
          sky_scout_24v_sub: string | null
          skylink_data_number: string | null
          skylink_pro_ip: string | null
          skylink_pro_rental: string | null
          skylink_pro_serial_number: string | null
          skylink_pro_sub: string | null
          skylink_sim_card_no: string | null
          skylink_trailer_sub: string | null
          skylink_trailer_unit_ip: string | null
          skylink_trailer_unit_rental: string | null
          skylink_trailer_unit_serial_number: string | null
          skylink_voice_kit_ip: string | null
          skylink_voice_kit_rental: string | null
          skylink_voice_kit_serial_number: string | null
          skylink_voice_kit_sub: string | null
          speaker: string | null
          speaker_rental: string | null
          stock_code: string | null
          stock_description: string | null
          t_piece: string | null
          t_piece_rental: string | null
          tag: string | null
          tag_reader: string | null
          tag_reader_rental: string | null
          tag_reader_rental_2: string | null
          tag_rental: string | null
          tag_rental_2: string | null
          total_ex_vat: string | null
          total_incl_vat: string | null
          total_rental: string | null
          total_rental_sub: string | null
          total_sub: string | null
          total_vat: string | null
          vw_100ip_driver_facing_ip: string | null
          vw_100ip_driver_facing_rental: string | null
          vw300_dakkie_dome_1: string | null
          vw300_dakkie_dome_1_rental: string | null
          vw300_dakkie_dome_2: string | null
          vw300_dakkie_dome_2_rental: string | null
          vw303_driver_facing_camera: string | null
          vw303_driver_facing_camera_rental: string | null
          vw306_dvr_road_facing_for_4ch_8ch: string | null
          vw306_dvr_road_facing_for_4ch_8ch_rental: string | null
          vw306m_a2_dash_cam: string | null
          vw306m_a2_dash_cam_rental: string | null
          vw400_dome_1: string | null
          vw400_dome_1_rental: string | null
          vw400_dome_2: string | null
          vw400_dome_2_rental: string | null
          vw502_dual_lens_camera: string | null
          vw502_dual_lens_camera_rental: string | null
          vw502f_road_facing_camera: string | null
          vw502f_road_facing_camera_rental: string | null
          year: string | null
        }
        Insert: {
          "2nd_month"?: number | null
          "3rd_month"?: number | null
          a2_dash_cam?: string | null
          a2_dash_cam_rental?: string | null
          a2_mec_5?: string | null
          a2_mec_5_rental?: string | null
          a3_dash_cam_ai?: string | null
          a3_dash_cam_ai_rental?: string | null
          account_number?: string | null
          account_number_2?: string | null
          active?: boolean | null
          adas_02_road_facing?: string | null
          adas_02_road_facing_rental?: string | null
          after_hours?: string | null
          amount_due?: string | null
          beame?: string | null
          beame_1_rental?: string | null
          beame_1_sub?: string | null
          beame_2?: string | null
          beame_2_rental?: string | null
          beame_2_sub?: string | null
          beame_3?: string | null
          beame_3_rental?: string | null
          beame_3_sub?: string | null
          beame_4?: string | null
          beame_4_rental?: string | null
          beame_4_sub?: string | null
          beame_5?: string | null
          beame_5_rental?: string | null
          beame_5_sub?: string | null
          breathaloc?: string | null
          breathaloc_rental?: string | null
          buzzer?: string | null
          buzzer_rental?: string | null
          cable_10m_for_camera_4pin?: string | null
          cable_10m_for_camera_4pin_rental?: string | null
          cable_5m_6pin?: string | null
          cable_5m_6pin_rental?: string | null
          cable_5m_for_camera_4pin?: string | null
          cable_5m_for_camera_4pin_rental?: string | null
          cia?: string | null
          cia_rental?: string | null
          colour?: string | null
          company?: string | null
          consultancy?: string | null
          controlroom?: string | null
          corpconnect_data_no?: string | null
          corpconnect_sim_no?: string | null
          data_number?: string | null
          dms01_driver_facing?: string | null
          dms01_driver_facing_rental?: string | null
          doc_no?: string | null
          dual_probe_rental?: string | null
          dual_probe_sub?: string | null
          early_warning?: string | null
          early_warning_rental?: string | null
          engine?: string | null
          extension_cable_1m?: string | null
          extension_cable_1m_rental?: string | null
          extension_cable_3m?: string | null
          extension_cable_3m_rental?: string | null
          flat_panic?: string | null
          flat_panic_rental?: string | null
          fleet_number?: string | null
          fm_unit?: string | null
          fm_unit_rental?: string | null
          fm_unit_sub?: string | null
          fuel_probe_1?: string | null
          fuel_probe_2?: string | null
          gps?: string | null
          gps_rental?: string | null
          group_name?: string | null
          gsm?: string | null
          gsm_rental?: string | null
          harness_7m_for_probe?: string | null
          harness_7m_for_probe_rental?: string | null
          id?: number
          idata?: string | null
          idata_rental?: string | null
          industrial_panic?: string | null
          industrial_panic_rental?: string | null
          ip_address?: string | null
          keypad?: string | null
          keypad_rental?: string | null
          keypad_waterproof?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          main_fm_harness?: string | null
          main_fm_harness_rental?: string | null
          maintenance?: string | null
          make?: string | null
          mdvr_4ch?: string | null
          mdvr_4ch_rental?: string | null
          mdvr_4ch_sub?: string | null
          mdvr_5ch?: string | null
          mdvr_5ch_rental?: string | null
          mdvr_5ch_sub?: string | null
          mdvr_8ch?: string | null
          mdvr_8ch_rental?: string | null
          mdvr_8ch_sub?: string | null
          mic?: string | null
          mic_rental?: string | null
          model?: string | null
          new_account_number?: string | null
          one_month?: number | null
          pfk_10m?: string | null
          pfk_10m_rental?: string | null
          pfk_15m?: string | null
          pfk_15m_rental?: string | null
          pfk_20m?: string | null
          pfk_20m_rental?: string | null
          pfk_5m?: string | null
          pfk_5m_rental?: string | null
          pfk_corpconnect_data_number?: string | null
          pfk_corpconnect_sim_number?: string | null
          pfk_dome_1?: string | null
          pfk_dome_1_rental?: string | null
          pfk_dome_2?: string | null
          pfk_dome_2_rental?: string | null
          pfk_driver_facing?: string | null
          pfk_driver_facing_rental?: string | null
          pfk_main_unit?: string | null
          pfk_main_unit_rental?: string | null
          pfk_main_unit_sub?: string | null
          pfk_road_facing?: string | null
          pfk_road_facing_rental?: string | null
          roaming?: string | null
          roller_door_switches?: string | null
          roller_door_switches_rental?: string | null
          sd_card_1tb?: string | null
          sd_card_1tb_rental?: string | null
          sd_card_250gb?: string | null
          sd_card_250gb_rental?: string | null
          sd_card_256gb?: string | null
          sd_card_256gb_rental?: string | null
          sd_card_2tb?: string | null
          sd_card_2tb_rental?: string | null
          sd_card_480gb?: string | null
          sd_card_480gb_rental?: string | null
          sd_card_512gb?: string | null
          sd_card_512gb_rental?: string | null
          sim_card_number?: string | null
          sim_id?: string | null
          single_probe_rental?: string | null
          single_probe_sub?: string | null
          sky_ican?: string | null
          sky_ican_rental?: string | null
          sky_idata?: string | null
          sky_idata_rental?: string | null
          sky_on_batt_ign_rental?: string | null
          sky_on_batt_ign_unit_ip?: string | null
          sky_on_batt_ign_unit_serial_number?: string | null
          sky_on_batt_sub?: string | null
          sky_safety?: string | null
          sky_scout_12v_ip?: string | null
          sky_scout_12v_rental?: string | null
          sky_scout_12v_serial_number?: string | null
          sky_scout_12v_sub?: string | null
          sky_scout_24v_ip?: string | null
          sky_scout_24v_rental?: string | null
          sky_scout_24v_serial_number?: string | null
          sky_scout_24v_sub?: string | null
          skylink_data_number?: string | null
          skylink_pro_ip?: string | null
          skylink_pro_rental?: string | null
          skylink_pro_serial_number?: string | null
          skylink_pro_sub?: string | null
          skylink_sim_card_no?: string | null
          skylink_trailer_sub?: string | null
          skylink_trailer_unit_ip?: string | null
          skylink_trailer_unit_rental?: string | null
          skylink_trailer_unit_serial_number?: string | null
          skylink_voice_kit_ip?: string | null
          skylink_voice_kit_rental?: string | null
          skylink_voice_kit_serial_number?: string | null
          skylink_voice_kit_sub?: string | null
          speaker?: string | null
          speaker_rental?: string | null
          stock_code?: string | null
          stock_description?: string | null
          t_piece?: string | null
          t_piece_rental?: string | null
          tag?: string | null
          tag_reader?: string | null
          tag_reader_rental?: string | null
          tag_reader_rental_2?: string | null
          tag_rental?: string | null
          tag_rental_2?: string | null
          total_ex_vat?: string | null
          total_incl_vat?: string | null
          total_rental?: string | null
          total_rental_sub?: string | null
          total_sub?: string | null
          total_vat?: string | null
          vw_100ip_driver_facing_ip?: string | null
          vw_100ip_driver_facing_rental?: string | null
          vw300_dakkie_dome_1?: string | null
          vw300_dakkie_dome_1_rental?: string | null
          vw300_dakkie_dome_2?: string | null
          vw300_dakkie_dome_2_rental?: string | null
          vw303_driver_facing_camera?: string | null
          vw303_driver_facing_camera_rental?: string | null
          vw306_dvr_road_facing_for_4ch_8ch?: string | null
          vw306_dvr_road_facing_for_4ch_8ch_rental?: string | null
          vw306m_a2_dash_cam?: string | null
          vw306m_a2_dash_cam_rental?: string | null
          vw400_dome_1?: string | null
          vw400_dome_1_rental?: string | null
          vw400_dome_2?: string | null
          vw400_dome_2_rental?: string | null
          vw502_dual_lens_camera?: string | null
          vw502_dual_lens_camera_rental?: string | null
          vw502f_road_facing_camera?: string | null
          vw502f_road_facing_camera_rental?: string | null
          year?: string | null
        }
        Update: {
          "2nd_month"?: number | null
          "3rd_month"?: number | null
          a2_dash_cam?: string | null
          a2_dash_cam_rental?: string | null
          a2_mec_5?: string | null
          a2_mec_5_rental?: string | null
          a3_dash_cam_ai?: string | null
          a3_dash_cam_ai_rental?: string | null
          account_number?: string | null
          account_number_2?: string | null
          active?: boolean | null
          adas_02_road_facing?: string | null
          adas_02_road_facing_rental?: string | null
          after_hours?: string | null
          amount_due?: string | null
          beame?: string | null
          beame_1_rental?: string | null
          beame_1_sub?: string | null
          beame_2?: string | null
          beame_2_rental?: string | null
          beame_2_sub?: string | null
          beame_3?: string | null
          beame_3_rental?: string | null
          beame_3_sub?: string | null
          beame_4?: string | null
          beame_4_rental?: string | null
          beame_4_sub?: string | null
          beame_5?: string | null
          beame_5_rental?: string | null
          beame_5_sub?: string | null
          breathaloc?: string | null
          breathaloc_rental?: string | null
          buzzer?: string | null
          buzzer_rental?: string | null
          cable_10m_for_camera_4pin?: string | null
          cable_10m_for_camera_4pin_rental?: string | null
          cable_5m_6pin?: string | null
          cable_5m_6pin_rental?: string | null
          cable_5m_for_camera_4pin?: string | null
          cable_5m_for_camera_4pin_rental?: string | null
          cia?: string | null
          cia_rental?: string | null
          colour?: string | null
          company?: string | null
          consultancy?: string | null
          controlroom?: string | null
          corpconnect_data_no?: string | null
          corpconnect_sim_no?: string | null
          data_number?: string | null
          dms01_driver_facing?: string | null
          dms01_driver_facing_rental?: string | null
          doc_no?: string | null
          dual_probe_rental?: string | null
          dual_probe_sub?: string | null
          early_warning?: string | null
          early_warning_rental?: string | null
          engine?: string | null
          extension_cable_1m?: string | null
          extension_cable_1m_rental?: string | null
          extension_cable_3m?: string | null
          extension_cable_3m_rental?: string | null
          flat_panic?: string | null
          flat_panic_rental?: string | null
          fleet_number?: string | null
          fm_unit?: string | null
          fm_unit_rental?: string | null
          fm_unit_sub?: string | null
          fuel_probe_1?: string | null
          fuel_probe_2?: string | null
          gps?: string | null
          gps_rental?: string | null
          group_name?: string | null
          gsm?: string | null
          gsm_rental?: string | null
          harness_7m_for_probe?: string | null
          harness_7m_for_probe_rental?: string | null
          id?: number
          idata?: string | null
          idata_rental?: string | null
          industrial_panic?: string | null
          industrial_panic_rental?: string | null
          ip_address?: string | null
          keypad?: string | null
          keypad_rental?: string | null
          keypad_waterproof?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          main_fm_harness?: string | null
          main_fm_harness_rental?: string | null
          maintenance?: string | null
          make?: string | null
          mdvr_4ch?: string | null
          mdvr_4ch_rental?: string | null
          mdvr_4ch_sub?: string | null
          mdvr_5ch?: string | null
          mdvr_5ch_rental?: string | null
          mdvr_5ch_sub?: string | null
          mdvr_8ch?: string | null
          mdvr_8ch_rental?: string | null
          mdvr_8ch_sub?: string | null
          mic?: string | null
          mic_rental?: string | null
          model?: string | null
          new_account_number?: string | null
          one_month?: number | null
          pfk_10m?: string | null
          pfk_10m_rental?: string | null
          pfk_15m?: string | null
          pfk_15m_rental?: string | null
          pfk_20m?: string | null
          pfk_20m_rental?: string | null
          pfk_5m?: string | null
          pfk_5m_rental?: string | null
          pfk_corpconnect_data_number?: string | null
          pfk_corpconnect_sim_number?: string | null
          pfk_dome_1?: string | null
          pfk_dome_1_rental?: string | null
          pfk_dome_2?: string | null
          pfk_dome_2_rental?: string | null
          pfk_driver_facing?: string | null
          pfk_driver_facing_rental?: string | null
          pfk_main_unit?: string | null
          pfk_main_unit_rental?: string | null
          pfk_main_unit_sub?: string | null
          pfk_road_facing?: string | null
          pfk_road_facing_rental?: string | null
          roaming?: string | null
          roller_door_switches?: string | null
          roller_door_switches_rental?: string | null
          sd_card_1tb?: string | null
          sd_card_1tb_rental?: string | null
          sd_card_250gb?: string | null
          sd_card_250gb_rental?: string | null
          sd_card_256gb?: string | null
          sd_card_256gb_rental?: string | null
          sd_card_2tb?: string | null
          sd_card_2tb_rental?: string | null
          sd_card_480gb?: string | null
          sd_card_480gb_rental?: string | null
          sd_card_512gb?: string | null
          sd_card_512gb_rental?: string | null
          sim_card_number?: string | null
          sim_id?: string | null
          single_probe_rental?: string | null
          single_probe_sub?: string | null
          sky_ican?: string | null
          sky_ican_rental?: string | null
          sky_idata?: string | null
          sky_idata_rental?: string | null
          sky_on_batt_ign_rental?: string | null
          sky_on_batt_ign_unit_ip?: string | null
          sky_on_batt_ign_unit_serial_number?: string | null
          sky_on_batt_sub?: string | null
          sky_safety?: string | null
          sky_scout_12v_ip?: string | null
          sky_scout_12v_rental?: string | null
          sky_scout_12v_serial_number?: string | null
          sky_scout_12v_sub?: string | null
          sky_scout_24v_ip?: string | null
          sky_scout_24v_rental?: string | null
          sky_scout_24v_serial_number?: string | null
          sky_scout_24v_sub?: string | null
          skylink_data_number?: string | null
          skylink_pro_ip?: string | null
          skylink_pro_rental?: string | null
          skylink_pro_serial_number?: string | null
          skylink_pro_sub?: string | null
          skylink_sim_card_no?: string | null
          skylink_trailer_sub?: string | null
          skylink_trailer_unit_ip?: string | null
          skylink_trailer_unit_rental?: string | null
          skylink_trailer_unit_serial_number?: string | null
          skylink_voice_kit_ip?: string | null
          skylink_voice_kit_rental?: string | null
          skylink_voice_kit_serial_number?: string | null
          skylink_voice_kit_sub?: string | null
          speaker?: string | null
          speaker_rental?: string | null
          stock_code?: string | null
          stock_description?: string | null
          t_piece?: string | null
          t_piece_rental?: string | null
          tag?: string | null
          tag_reader?: string | null
          tag_reader_rental?: string | null
          tag_reader_rental_2?: string | null
          tag_rental?: string | null
          tag_rental_2?: string | null
          total_ex_vat?: string | null
          total_incl_vat?: string | null
          total_rental?: string | null
          total_rental_sub?: string | null
          total_sub?: string | null
          total_vat?: string | null
          vw_100ip_driver_facing_ip?: string | null
          vw_100ip_driver_facing_rental?: string | null
          vw300_dakkie_dome_1?: string | null
          vw300_dakkie_dome_1_rental?: string | null
          vw300_dakkie_dome_2?: string | null
          vw300_dakkie_dome_2_rental?: string | null
          vw303_driver_facing_camera?: string | null
          vw303_driver_facing_camera_rental?: string | null
          vw306_dvr_road_facing_for_4ch_8ch?: string | null
          vw306_dvr_road_facing_for_4ch_8ch_rental?: string | null
          vw306m_a2_dash_cam?: string | null
          vw306m_a2_dash_cam_rental?: string | null
          vw400_dome_1?: string | null
          vw400_dome_1_rental?: string | null
          vw400_dome_2?: string | null
          vw400_dome_2_rental?: string | null
          vw502_dual_lens_camera?: string | null
          vw502_dual_lens_camera_rental?: string | null
          vw502f_road_facing_camera?: string | null
          vw502f_road_facing_camera_rental?: string | null
          year?: string | null
        }
        Relationships: []
      }
      vehicle_logs: {
        Row: {
          cost_center: string | null
          created_at: string
          driver_name: string | null
          id: number
          status: string | null
          vehicle_registration: string | null
        }
        Insert: {
          cost_center?: string | null
          created_at?: string
          driver_name?: string | null
          id?: number
          status?: string | null
          vehicle_registration?: string | null
        }
        Update: {
          cost_center?: string | null
          created_at?: string
          driver_name?: string | null
          id?: number
          status?: string | null
          vehicle_registration?: string | null
        }
        Relationships: []
      }
      vehicle_rewards: {
        Row: {
          claim_type: string
          created_at: string | null
          driver_name: string
          eligibility: string
          excess_amount: number
          gross_incurred: number
          id: string
          insurance_summary_id: string | null
          insurer_claim_amount: number
          month: number
          plate: string
          reward_amount: number
          total_points: number
          vehicle_type: string
          year: number
        }
        Insert: {
          claim_type: string
          created_at?: string | null
          driver_name: string
          eligibility?: string
          excess_amount?: number
          gross_incurred?: number
          id?: string
          insurance_summary_id?: string | null
          insurer_claim_amount?: number
          month: number
          plate: string
          reward_amount?: number
          total_points?: number
          vehicle_type: string
          year: number
        }
        Update: {
          claim_type?: string
          created_at?: string | null
          driver_name?: string
          eligibility?: string
          excess_amount?: number
          gross_incurred?: number
          id?: string
          insurance_summary_id?: string | null
          insurer_claim_amount?: number
          month?: number
          plate?: string
          reward_amount?: number
          total_points?: number
          vehicle_type?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_rewards_insurance_summary_id_fkey"
            columns: ["insurance_summary_id"]
            isOneToOne: false
            referencedRelation: "insurance_summaries"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          _10m_cable_for_camera_4pin: string | null
          _10m_cable_for_camera_4pin_rental: string | null
          _1m_extension_cable: string | null
          _1m_extension_cable_rental: string | null
          _3m_extension_cable: string | null
          _3m_extension_cable_rental: string | null
          _4ch_mdvr: string | null
          _4ch_mdvr_rental: string | null
          _4ch_mdvr_sub: string | null
          _5ch_mdvr: string | null
          _5ch_mdvr_rental: string | null
          _5ch_mdvr_sub: string | null
          _5m_cable_6pin: string | null
          _5m_cable_6pin_rental: string | null
          _5m_cable_for_camera_4pin: string | null
          _5m_cable_for_camera_4pin_rental: string | null
          _7m_harness_for_probe: string | null
          _7m_harness_for_probe_rental: string | null
          _8ch_mdvr: string | null
          _8ch_mdvr_rental: string | null
          _8ch_mdvr_sub: string | null
          a2_dash_cam: string | null
          a2_dash_cam_rental: string | null
          a2_dash_cam_sub: string | null
          a2_mec_5: string | null
          a2_mec_5_rental: string | null
          a3_dash_cam_ai: string | null
          a3_dash_cam_ai_rental: string | null
          account_number: string | null
          adas_02_road_facing: string | null
          adas_02_road_facing_rental: string | null
          after_hours: string | null
          beame_1: string | null
          beame_1_rental: string | null
          beame_1_sub: string | null
          beame_2: string | null
          beame_2_rental: string | null
          beame_2_sub: string | null
          beame_3: string | null
          beame_3_rental: string | null
          beame_3_sub: string | null
          beame_4: string | null
          beame_4_rental: string | null
          beame_4_sub: string | null
          beame_5: string | null
          beame_5_rental: string | null
          beame_5_sub: string | null
          branch: string | null
          breathaloc: string | null
          breathaloc_rental: string | null
          buzzer: string | null
          buzzer_rental: string | null
          cia: string | null
          cia_rental: string | null
          colour: string | null
          company: string | null
          consultancy: string | null
          controlroom: string | null
          corpconnect_data_no: string | null
          corpconnect_sim_no: string | null
          created_at: string
          data_number: string | null
          dms01_driver_facing: string | null
          dms01_driver_facing_rental: string | null
          dual_probe_rental: string | null
          dual_probe_sub: string | null
          early_warning: string | null
          early_warning_rental: string | null
          engine: string | null
          flat_panic: string | null
          flat_panic_rental: string | null
          fleet_number: string | null
          fm_unit: string | null
          fm_unit_rental: string | null
          fm_unit_sub: string | null
          fuel_probe_1: string | null
          fuel_probe_2: string | null
          gps: string | null
          gps_rental: string | null
          gsm: string | null
          gsm_rental: string | null
          id: number
          idata: string | null
          idata_rental: string | null
          industrial_panic: string | null
          industrial_panic_rental: string | null
          keypad: string | null
          keypad_rental: string | null
          keypad_waterproof: string | null
          main_fm_harness: string | null
          main_fm_harness_rental: string | null
          maintenance: string | null
          make: string | null
          mic: string | null
          mic_rental: string | null
          model: string | null
          new_account_number: string | null
          pfk_10m: string | null
          pfk_10m_rental: string | null
          pfk_15m: string | null
          pfk_15m_rental: string | null
          pfk_20m: string | null
          pfk_20m_rental: string | null
          pfk_5m: string | null
          pfk_5m_rental: string | null
          pfk_corpconnect_data_number: string | null
          pfk_corpconnect_sim_number: string | null
          pfk_dome_1: string | null
          pfk_dome_1_rental: string | null
          pfk_dome_2: string | null
          pfk_dome_2_rental: string | null
          pfk_driver_facing: string | null
          pfk_driver_facing_rental: string | null
          pfk_main_unit: string | null
          pfk_main_unit_rental: string | null
          pfk_main_unit_sub: string | null
          pfk_road_facing: string | null
          pfk_road_facing_rental: string | null
          reg: string | null
          roaming: string | null
          roller_door_switches: string | null
          roller_door_switches_rental: string | null
          sd_card_1tb: string | null
          sd_card_1tb_rental: string | null
          sd_card_250gb: string | null
          sd_card_250gb_rental: string | null
          sd_card_256gb: string | null
          sd_card_256gb_rental: string | null
          sd_card_2tb: string | null
          sd_card_2tb_rental: string | null
          sd_card_480gb: string | null
          sd_card_480gb_rental: string | null
          sd_card_512gb: string | null
          sd_card_512gb_rental: string | null
          sim_card_number: string | null
          sim_id: string | null
          single_probe_rental: string | null
          single_probe_sub: string | null
          sky_ican: string | null
          sky_ican_rental: string | null
          sky_idata: string | null
          sky_idata_rental: string | null
          sky_on_batt_ign_rental: string | null
          sky_on_batt_ign_unit_ip: string | null
          sky_on_batt_ign_unit_serial_number: string | null
          sky_on_batt_sub: string | null
          sky_safety: string | null
          sky_scout_12v_ip: string | null
          sky_scout_12v_rental: string | null
          sky_scout_12v_serial_number: string | null
          sky_scout_12v_sub: string | null
          sky_scout_24v_ip: string | null
          sky_scout_24v_rental: string | null
          sky_scout_24v_serial_number: string | null
          sky_scout_24v_sub: string | null
          skylink_data_number: string | null
          skylink_pro_ip: string | null
          skylink_pro_rental: string | null
          skylink_pro_serial_number: string | null
          skylink_pro_sub: string | null
          skylink_sim_card_no: string | null
          skylink_trailer_sub: string | null
          skylink_trailer_unit_ip: string | null
          skylink_trailer_unit_rental: string | null
          skylink_trailer_unit_serial_number: string | null
          skylink_voice_kit_ip: string | null
          skylink_voice_kit_rental: string | null
          skylink_voice_kit_serial_number: string | null
          skylink_voice_kit_sub: string | null
          speaker: string | null
          speaker_rental: string | null
          tag: string | null
          tag_: string | null
          tag_reader: string | null
          tag_reader_: string | null
          tag_reader_rental: string | null
          tag_reader_rental_: string | null
          tag_rental: string | null
          tag_rental_: string | null
          total_rental: number | null
          total_rental_sub: number | null
          total_sub: number | null
          tpiece: string | null
          tpiece_rental: string | null
          unique_id: string | null
          vin: string | null
          vw100ip_driver_facing_ip: string | null
          vw100ip_driver_facing_rental: string | null
          vw300_dakkie_dome_1: string | null
          vw300_dakkie_dome_1_rental: string | null
          vw300_dakkie_dome_2: string | null
          vw300_dakkie_dome_2_rental: string | null
          vw303_driver_facing_camera: string | null
          vw303_driver_facing_camera_rental: string | null
          vw306_dvr_road_facing_for_4ch_8ch: string | null
          vw306_dvr_road_facing_for_4ch_8ch_rental: string | null
          vw306m_a2_dash_cam: string | null
          vw306m_a2_dash_cam_rental: string | null
          vw400_dome_1: string | null
          vw400_dome_1_rental: string | null
          vw400_dome_2: string | null
          vw400_dome_2_rental: string | null
          vw502_dual_lens_camera: string | null
          vw502_dual_lens_camera_rental: string | null
          vw502f_road_facing_camera: string | null
          vw502f_road_facing_camera_rental: string | null
          year: string | null
        }
        Insert: {
          _10m_cable_for_camera_4pin?: string | null
          _10m_cable_for_camera_4pin_rental?: string | null
          _1m_extension_cable?: string | null
          _1m_extension_cable_rental?: string | null
          _3m_extension_cable?: string | null
          _3m_extension_cable_rental?: string | null
          _4ch_mdvr?: string | null
          _4ch_mdvr_rental?: string | null
          _4ch_mdvr_sub?: string | null
          _5ch_mdvr?: string | null
          _5ch_mdvr_rental?: string | null
          _5ch_mdvr_sub?: string | null
          _5m_cable_6pin?: string | null
          _5m_cable_6pin_rental?: string | null
          _5m_cable_for_camera_4pin?: string | null
          _5m_cable_for_camera_4pin_rental?: string | null
          _7m_harness_for_probe?: string | null
          _7m_harness_for_probe_rental?: string | null
          _8ch_mdvr?: string | null
          _8ch_mdvr_rental?: string | null
          _8ch_mdvr_sub?: string | null
          a2_dash_cam?: string | null
          a2_dash_cam_rental?: string | null
          a2_dash_cam_sub?: string | null
          a2_mec_5?: string | null
          a2_mec_5_rental?: string | null
          a3_dash_cam_ai?: string | null
          a3_dash_cam_ai_rental?: string | null
          account_number?: string | null
          adas_02_road_facing?: string | null
          adas_02_road_facing_rental?: string | null
          after_hours?: string | null
          beame_1?: string | null
          beame_1_rental?: string | null
          beame_1_sub?: string | null
          beame_2?: string | null
          beame_2_rental?: string | null
          beame_2_sub?: string | null
          beame_3?: string | null
          beame_3_rental?: string | null
          beame_3_sub?: string | null
          beame_4?: string | null
          beame_4_rental?: string | null
          beame_4_sub?: string | null
          beame_5?: string | null
          beame_5_rental?: string | null
          beame_5_sub?: string | null
          branch?: string | null
          breathaloc?: string | null
          breathaloc_rental?: string | null
          buzzer?: string | null
          buzzer_rental?: string | null
          cia?: string | null
          cia_rental?: string | null
          colour?: string | null
          company?: string | null
          consultancy?: string | null
          controlroom?: string | null
          corpconnect_data_no?: string | null
          corpconnect_sim_no?: string | null
          created_at?: string
          data_number?: string | null
          dms01_driver_facing?: string | null
          dms01_driver_facing_rental?: string | null
          dual_probe_rental?: string | null
          dual_probe_sub?: string | null
          early_warning?: string | null
          early_warning_rental?: string | null
          engine?: string | null
          flat_panic?: string | null
          flat_panic_rental?: string | null
          fleet_number?: string | null
          fm_unit?: string | null
          fm_unit_rental?: string | null
          fm_unit_sub?: string | null
          fuel_probe_1?: string | null
          fuel_probe_2?: string | null
          gps?: string | null
          gps_rental?: string | null
          gsm?: string | null
          gsm_rental?: string | null
          id?: number
          idata?: string | null
          idata_rental?: string | null
          industrial_panic?: string | null
          industrial_panic_rental?: string | null
          keypad?: string | null
          keypad_rental?: string | null
          keypad_waterproof?: string | null
          main_fm_harness?: string | null
          main_fm_harness_rental?: string | null
          maintenance?: string | null
          make?: string | null
          mic?: string | null
          mic_rental?: string | null
          model?: string | null
          new_account_number?: string | null
          pfk_10m?: string | null
          pfk_10m_rental?: string | null
          pfk_15m?: string | null
          pfk_15m_rental?: string | null
          pfk_20m?: string | null
          pfk_20m_rental?: string | null
          pfk_5m?: string | null
          pfk_5m_rental?: string | null
          pfk_corpconnect_data_number?: string | null
          pfk_corpconnect_sim_number?: string | null
          pfk_dome_1?: string | null
          pfk_dome_1_rental?: string | null
          pfk_dome_2?: string | null
          pfk_dome_2_rental?: string | null
          pfk_driver_facing?: string | null
          pfk_driver_facing_rental?: string | null
          pfk_main_unit?: string | null
          pfk_main_unit_rental?: string | null
          pfk_main_unit_sub?: string | null
          pfk_road_facing?: string | null
          pfk_road_facing_rental?: string | null
          reg?: string | null
          roaming?: string | null
          roller_door_switches?: string | null
          roller_door_switches_rental?: string | null
          sd_card_1tb?: string | null
          sd_card_1tb_rental?: string | null
          sd_card_250gb?: string | null
          sd_card_250gb_rental?: string | null
          sd_card_256gb?: string | null
          sd_card_256gb_rental?: string | null
          sd_card_2tb?: string | null
          sd_card_2tb_rental?: string | null
          sd_card_480gb?: string | null
          sd_card_480gb_rental?: string | null
          sd_card_512gb?: string | null
          sd_card_512gb_rental?: string | null
          sim_card_number?: string | null
          sim_id?: string | null
          single_probe_rental?: string | null
          single_probe_sub?: string | null
          sky_ican?: string | null
          sky_ican_rental?: string | null
          sky_idata?: string | null
          sky_idata_rental?: string | null
          sky_on_batt_ign_rental?: string | null
          sky_on_batt_ign_unit_ip?: string | null
          sky_on_batt_ign_unit_serial_number?: string | null
          sky_on_batt_sub?: string | null
          sky_safety?: string | null
          sky_scout_12v_ip?: string | null
          sky_scout_12v_rental?: string | null
          sky_scout_12v_serial_number?: string | null
          sky_scout_12v_sub?: string | null
          sky_scout_24v_ip?: string | null
          sky_scout_24v_rental?: string | null
          sky_scout_24v_serial_number?: string | null
          sky_scout_24v_sub?: string | null
          skylink_data_number?: string | null
          skylink_pro_ip?: string | null
          skylink_pro_rental?: string | null
          skylink_pro_serial_number?: string | null
          skylink_pro_sub?: string | null
          skylink_sim_card_no?: string | null
          skylink_trailer_sub?: string | null
          skylink_trailer_unit_ip?: string | null
          skylink_trailer_unit_rental?: string | null
          skylink_trailer_unit_serial_number?: string | null
          skylink_voice_kit_ip?: string | null
          skylink_voice_kit_rental?: string | null
          skylink_voice_kit_serial_number?: string | null
          skylink_voice_kit_sub?: string | null
          speaker?: string | null
          speaker_rental?: string | null
          tag?: string | null
          tag_?: string | null
          tag_reader?: string | null
          tag_reader_?: string | null
          tag_reader_rental?: string | null
          tag_reader_rental_?: string | null
          tag_rental?: string | null
          tag_rental_?: string | null
          total_rental?: number | null
          total_rental_sub?: number | null
          total_sub?: number | null
          tpiece?: string | null
          tpiece_rental?: string | null
          unique_id?: string | null
          vin?: string | null
          vw100ip_driver_facing_ip?: string | null
          vw100ip_driver_facing_rental?: string | null
          vw300_dakkie_dome_1?: string | null
          vw300_dakkie_dome_1_rental?: string | null
          vw300_dakkie_dome_2?: string | null
          vw300_dakkie_dome_2_rental?: string | null
          vw303_driver_facing_camera?: string | null
          vw303_driver_facing_camera_rental?: string | null
          vw306_dvr_road_facing_for_4ch_8ch?: string | null
          vw306_dvr_road_facing_for_4ch_8ch_rental?: string | null
          vw306m_a2_dash_cam?: string | null
          vw306m_a2_dash_cam_rental?: string | null
          vw400_dome_1?: string | null
          vw400_dome_1_rental?: string | null
          vw400_dome_2?: string | null
          vw400_dome_2_rental?: string | null
          vw502_dual_lens_camera?: string | null
          vw502_dual_lens_camera_rental?: string | null
          vw502f_road_facing_camera?: string | null
          vw502f_road_facing_camera_rental?: string | null
          year?: string | null
        }
        Update: {
          _10m_cable_for_camera_4pin?: string | null
          _10m_cable_for_camera_4pin_rental?: string | null
          _1m_extension_cable?: string | null
          _1m_extension_cable_rental?: string | null
          _3m_extension_cable?: string | null
          _3m_extension_cable_rental?: string | null
          _4ch_mdvr?: string | null
          _4ch_mdvr_rental?: string | null
          _4ch_mdvr_sub?: string | null
          _5ch_mdvr?: string | null
          _5ch_mdvr_rental?: string | null
          _5ch_mdvr_sub?: string | null
          _5m_cable_6pin?: string | null
          _5m_cable_6pin_rental?: string | null
          _5m_cable_for_camera_4pin?: string | null
          _5m_cable_for_camera_4pin_rental?: string | null
          _7m_harness_for_probe?: string | null
          _7m_harness_for_probe_rental?: string | null
          _8ch_mdvr?: string | null
          _8ch_mdvr_rental?: string | null
          _8ch_mdvr_sub?: string | null
          a2_dash_cam?: string | null
          a2_dash_cam_rental?: string | null
          a2_dash_cam_sub?: string | null
          a2_mec_5?: string | null
          a2_mec_5_rental?: string | null
          a3_dash_cam_ai?: string | null
          a3_dash_cam_ai_rental?: string | null
          account_number?: string | null
          adas_02_road_facing?: string | null
          adas_02_road_facing_rental?: string | null
          after_hours?: string | null
          beame_1?: string | null
          beame_1_rental?: string | null
          beame_1_sub?: string | null
          beame_2?: string | null
          beame_2_rental?: string | null
          beame_2_sub?: string | null
          beame_3?: string | null
          beame_3_rental?: string | null
          beame_3_sub?: string | null
          beame_4?: string | null
          beame_4_rental?: string | null
          beame_4_sub?: string | null
          beame_5?: string | null
          beame_5_rental?: string | null
          beame_5_sub?: string | null
          branch?: string | null
          breathaloc?: string | null
          breathaloc_rental?: string | null
          buzzer?: string | null
          buzzer_rental?: string | null
          cia?: string | null
          cia_rental?: string | null
          colour?: string | null
          company?: string | null
          consultancy?: string | null
          controlroom?: string | null
          corpconnect_data_no?: string | null
          corpconnect_sim_no?: string | null
          created_at?: string
          data_number?: string | null
          dms01_driver_facing?: string | null
          dms01_driver_facing_rental?: string | null
          dual_probe_rental?: string | null
          dual_probe_sub?: string | null
          early_warning?: string | null
          early_warning_rental?: string | null
          engine?: string | null
          flat_panic?: string | null
          flat_panic_rental?: string | null
          fleet_number?: string | null
          fm_unit?: string | null
          fm_unit_rental?: string | null
          fm_unit_sub?: string | null
          fuel_probe_1?: string | null
          fuel_probe_2?: string | null
          gps?: string | null
          gps_rental?: string | null
          gsm?: string | null
          gsm_rental?: string | null
          id?: number
          idata?: string | null
          idata_rental?: string | null
          industrial_panic?: string | null
          industrial_panic_rental?: string | null
          keypad?: string | null
          keypad_rental?: string | null
          keypad_waterproof?: string | null
          main_fm_harness?: string | null
          main_fm_harness_rental?: string | null
          maintenance?: string | null
          make?: string | null
          mic?: string | null
          mic_rental?: string | null
          model?: string | null
          new_account_number?: string | null
          pfk_10m?: string | null
          pfk_10m_rental?: string | null
          pfk_15m?: string | null
          pfk_15m_rental?: string | null
          pfk_20m?: string | null
          pfk_20m_rental?: string | null
          pfk_5m?: string | null
          pfk_5m_rental?: string | null
          pfk_corpconnect_data_number?: string | null
          pfk_corpconnect_sim_number?: string | null
          pfk_dome_1?: string | null
          pfk_dome_1_rental?: string | null
          pfk_dome_2?: string | null
          pfk_dome_2_rental?: string | null
          pfk_driver_facing?: string | null
          pfk_driver_facing_rental?: string | null
          pfk_main_unit?: string | null
          pfk_main_unit_rental?: string | null
          pfk_main_unit_sub?: string | null
          pfk_road_facing?: string | null
          pfk_road_facing_rental?: string | null
          reg?: string | null
          roaming?: string | null
          roller_door_switches?: string | null
          roller_door_switches_rental?: string | null
          sd_card_1tb?: string | null
          sd_card_1tb_rental?: string | null
          sd_card_250gb?: string | null
          sd_card_250gb_rental?: string | null
          sd_card_256gb?: string | null
          sd_card_256gb_rental?: string | null
          sd_card_2tb?: string | null
          sd_card_2tb_rental?: string | null
          sd_card_480gb?: string | null
          sd_card_480gb_rental?: string | null
          sd_card_512gb?: string | null
          sd_card_512gb_rental?: string | null
          sim_card_number?: string | null
          sim_id?: string | null
          single_probe_rental?: string | null
          single_probe_sub?: string | null
          sky_ican?: string | null
          sky_ican_rental?: string | null
          sky_idata?: string | null
          sky_idata_rental?: string | null
          sky_on_batt_ign_rental?: string | null
          sky_on_batt_ign_unit_ip?: string | null
          sky_on_batt_ign_unit_serial_number?: string | null
          sky_on_batt_sub?: string | null
          sky_safety?: string | null
          sky_scout_12v_ip?: string | null
          sky_scout_12v_rental?: string | null
          sky_scout_12v_serial_number?: string | null
          sky_scout_12v_sub?: string | null
          sky_scout_24v_ip?: string | null
          sky_scout_24v_rental?: string | null
          sky_scout_24v_serial_number?: string | null
          sky_scout_24v_sub?: string | null
          skylink_data_number?: string | null
          skylink_pro_ip?: string | null
          skylink_pro_rental?: string | null
          skylink_pro_serial_number?: string | null
          skylink_pro_sub?: string | null
          skylink_sim_card_no?: string | null
          skylink_trailer_sub?: string | null
          skylink_trailer_unit_ip?: string | null
          skylink_trailer_unit_rental?: string | null
          skylink_trailer_unit_serial_number?: string | null
          skylink_voice_kit_ip?: string | null
          skylink_voice_kit_rental?: string | null
          skylink_voice_kit_serial_number?: string | null
          skylink_voice_kit_sub?: string | null
          speaker?: string | null
          speaker_rental?: string | null
          tag?: string | null
          tag_?: string | null
          tag_reader?: string | null
          tag_reader_?: string | null
          tag_reader_rental?: string | null
          tag_reader_rental_?: string | null
          tag_rental?: string | null
          tag_rental_?: string | null
          total_rental?: number | null
          total_rental_sub?: number | null
          total_sub?: number | null
          tpiece?: string | null
          tpiece_rental?: string | null
          unique_id?: string | null
          vin?: string | null
          vw100ip_driver_facing_ip?: string | null
          vw100ip_driver_facing_rental?: string | null
          vw300_dakkie_dome_1?: string | null
          vw300_dakkie_dome_1_rental?: string | null
          vw300_dakkie_dome_2?: string | null
          vw300_dakkie_dome_2_rental?: string | null
          vw303_driver_facing_camera?: string | null
          vw303_driver_facing_camera_rental?: string | null
          vw306_dvr_road_facing_for_4ch_8ch?: string | null
          vw306_dvr_road_facing_for_4ch_8ch_rental?: string | null
          vw306m_a2_dash_cam?: string | null
          vw306m_a2_dash_cam_rental?: string | null
          vw400_dome_1?: string | null
          vw400_dome_1_rental?: string | null
          vw400_dome_2?: string | null
          vw400_dome_2_rental?: string | null
          vw502_dual_lens_camera?: string | null
          vw502_dual_lens_camera_rental?: string | null
          vw502f_road_facing_camera?: string | null
          vw502f_road_facing_camera_rental?: string | null
          year?: string | null
        }
        Relationships: []
      }
      vehicles_ip: {
        Row: {
          a2_dash_cam: string | null
          a2_dash_cam_rental: string | null
          a2_mec_5: string | null
          a2_mec_5_rental: string | null
          a3_dash_cam_ai: string | null
          a3_dash_cam_ai_rental: string | null
          account_number: string | null
          account_number_2: string | null
          active: boolean | null
          adas_02_road_facing: string | null
          adas_02_road_facing_rental: string | null
          after_hours: string | null
          beame_1: string | null
          beame_1_rental: string | null
          beame_1_sub: string | null
          beame_2: string | null
          beame_2_rental: string | null
          beame_2_sub: string | null
          beame_3: string | null
          beame_3_rental: string | null
          beame_3_sub: string | null
          beame_4: string | null
          beame_4_rental: string | null
          beame_4_sub: string | null
          beame_5: string | null
          beame_5_rental: string | null
          beame_5_sub: string | null
          branch: string | null
          breathaloc: string | null
          breathaloc_rental: string | null
          buzzer: string | null
          buzzer_rental: string | null
          cable_10m_for_camera_4pin: string | null
          cable_10m_for_camera_4pin_rental: string | null
          cable_5m_6pin: string | null
          cable_5m_6pin_rental: string | null
          cable_5m_for_camera_4pin: string | null
          cable_5m_for_camera_4pin_rental: string | null
          cia: string | null
          cia_rental: string | null
          colour: string | null
          comment: string | null
          company: string | null
          consultancy: string | null
          controlroom: string | null
          corpconnect_data_no: string | null
          corpconnect_sim_no: string | null
          cost_code: string | null
          data_number: string | null
          dms01_driver_facing: string | null
          dms01_driver_facing_rental: string | null
          dual_probe_rental: string | null
          dual_probe_sub: string | null
          early_warning: string | null
          early_warning_rental: string | null
          engine: string | null
          extension_cable_1m: string | null
          extension_cable_1m_rental: string | null
          extension_cable_3m: string | null
          extension_cable_3m_rental: string | null
          flat_panic: string | null
          flat_panic_rental: string | null
          fleet_number: string | null
          fm_unit: string | null
          fm_unit_rental: string | null
          fm_unit_sub: string | null
          fuel_probe_1: string | null
          fuel_probe_2: string | null
          gps: string | null
          gps_rental: string | null
          group_name: string | null
          gsm: string | null
          gsm_rental: string | null
          harness_7m_for_probe: string | null
          harness_7m_for_probe_rental: string | null
          id: number
          idata: string | null
          idata_rental: string | null
          industrial_panic: string | null
          industrial_panic_rental: string | null
          ip_address: string | null
          keypad: string | null
          keypad_rental: string | null
          keypad_waterproof: string | null
          loan: boolean | null
          loan_return_date: string | null
          main_fm_harness: string | null
          main_fm_harness_rental: string | null
          maintenance: string | null
          make: string | null
          mdvr_4ch: string | null
          mdvr_4ch_rental: string | null
          mdvr_4ch_sub: string | null
          mdvr_5ch: string | null
          mdvr_5ch_rental: string | null
          mdvr_5ch_sub: string | null
          mdvr_8ch: string | null
          mdvr_8ch_rental: string | null
          mdvr_8ch_sub: string | null
          mic: string | null
          mic_rental: string | null
          model: string | null
          new_account_number: string
          new_registration: string | null
          pfk_10m: string | null
          pfk_10m_rental: string | null
          pfk_15m: string | null
          pfk_15m_rental: string | null
          pfk_20m: string | null
          pfk_20m_rental: string | null
          pfk_5m: string | null
          pfk_5m_rental: string | null
          pfk_corpconnect_data_number: string | null
          pfk_corpconnect_sim_number: string | null
          pfk_dome_1: string | null
          pfk_dome_1_rental: string | null
          pfk_dome_2: string | null
          pfk_dome_2_rental: string | null
          pfk_driver_facing: string | null
          pfk_driver_facing_rental: string | null
          pfk_main_unit: string | null
          pfk_main_unit_rental: string | null
          pfk_main_unit_sub: string | null
          pfk_road_facing: string | null
          pfk_road_facing_rental: string | null
          products: Json[]
          roaming: string | null
          roller_door_switches: string | null
          roller_door_switches_rental: string | null
          sd_card_1tb: string | null
          sd_card_1tb_rental: string | null
          sd_card_250gb: string | null
          sd_card_250gb_rental: string | null
          sd_card_256gb: string | null
          sd_card_256gb_rental: string | null
          sd_card_2tb: string | null
          sd_card_2tb_rental: string | null
          sd_card_480gb: string | null
          sd_card_480gb_rental: string | null
          sd_card_512gb: string | null
          sd_card_512gb_rental: string | null
          sim_card_number: string | null
          sim_id: string | null
          single_probe_rental: string | null
          single_probe_sub: string | null
          sky_ican: string | null
          sky_ican_rental: string | null
          sky_idata: string | null
          sky_idata_rental: string | null
          sky_on_batt_ign_rental: string | null
          sky_on_batt_ign_unit_ip: string | null
          sky_on_batt_ign_unit_serial_number: string | null
          sky_on_batt_sub: string | null
          sky_safety: string | null
          sky_scout_12v_ip: string | null
          sky_scout_12v_rental: string | null
          sky_scout_12v_serial_number: string | null
          sky_scout_12v_sub: string | null
          sky_scout_24v_ip: string | null
          sky_scout_24v_rental: string | null
          sky_scout_24v_serial_number: string | null
          sky_scout_24v_sub: string | null
          skylink_data_number: string | null
          skylink_pro_ip: string | null
          skylink_pro_rental: string | null
          skylink_pro_serial_number: string | null
          skylink_pro_sub: string | null
          skylink_sim_card_no: string | null
          skylink_trailer_sub: string | null
          skylink_trailer_unit_ip: string | null
          skylink_trailer_unit_rental: string | null
          skylink_trailer_unit_serial_number: string | null
          skylink_voice_kit_ip: string | null
          skylink_voice_kit_rental: string | null
          skylink_voice_kit_serial_number: string | null
          skylink_voice_kit_sub: string | null
          speaker: string | null
          speaker_rental: string | null
          t_piece: string | null
          t_piece_rental: string | null
          tag: string | null
          tag_reader: string | null
          tag_reader_rental: string | null
          tag_reader_rental_2: string | null
          tag_rental: string | null
          tag_rental_2: string | null
          total_rental: string | null
          total_rental_sub: string | null
          total_sub: string | null
          vin_number: string | null
          vw_100ip_driver_facing_ip: string | null
          vw_100ip_driver_facing_rental: string | null
          vw300_dakkie_dome_1: string | null
          vw300_dakkie_dome_1_rental: string | null
          vw300_dakkie_dome_2: string | null
          vw300_dakkie_dome_2_rental: string | null
          vw303_driver_facing_camera: string | null
          vw303_driver_facing_camera_rental: string | null
          vw306_dvr_road_facing_for_4ch_8ch: string | null
          vw306_dvr_road_facing_for_4ch_8ch_rental: string | null
          vw306m_a2_dash_cam: string | null
          vw306m_a2_dash_cam_rental: string | null
          vw400_dome_1: string | null
          vw400_dome_1_rental: string | null
          vw400_dome_2: string | null
          vw400_dome_2_rental: string | null
          vw502_dual_lens_camera: string | null
          vw502_dual_lens_camera_rental: string | null
          vw502f_road_facing_camera: string | null
          vw502f_road_facing_camera_rental: string | null
          year: string | null
        }
        Insert: {
          a2_dash_cam?: string | null
          a2_dash_cam_rental?: string | null
          a2_mec_5?: string | null
          a2_mec_5_rental?: string | null
          a3_dash_cam_ai?: string | null
          a3_dash_cam_ai_rental?: string | null
          account_number?: string | null
          account_number_2?: string | null
          active?: boolean | null
          adas_02_road_facing?: string | null
          adas_02_road_facing_rental?: string | null
          after_hours?: string | null
          beame_1?: string | null
          beame_1_rental?: string | null
          beame_1_sub?: string | null
          beame_2?: string | null
          beame_2_rental?: string | null
          beame_2_sub?: string | null
          beame_3?: string | null
          beame_3_rental?: string | null
          beame_3_sub?: string | null
          beame_4?: string | null
          beame_4_rental?: string | null
          beame_4_sub?: string | null
          beame_5?: string | null
          beame_5_rental?: string | null
          beame_5_sub?: string | null
          branch?: string | null
          breathaloc?: string | null
          breathaloc_rental?: string | null
          buzzer?: string | null
          buzzer_rental?: string | null
          cable_10m_for_camera_4pin?: string | null
          cable_10m_for_camera_4pin_rental?: string | null
          cable_5m_6pin?: string | null
          cable_5m_6pin_rental?: string | null
          cable_5m_for_camera_4pin?: string | null
          cable_5m_for_camera_4pin_rental?: string | null
          cia?: string | null
          cia_rental?: string | null
          colour?: string | null
          comment?: string | null
          company?: string | null
          consultancy?: string | null
          controlroom?: string | null
          corpconnect_data_no?: string | null
          corpconnect_sim_no?: string | null
          cost_code?: string | null
          data_number?: string | null
          dms01_driver_facing?: string | null
          dms01_driver_facing_rental?: string | null
          dual_probe_rental?: string | null
          dual_probe_sub?: string | null
          early_warning?: string | null
          early_warning_rental?: string | null
          engine?: string | null
          extension_cable_1m?: string | null
          extension_cable_1m_rental?: string | null
          extension_cable_3m?: string | null
          extension_cable_3m_rental?: string | null
          flat_panic?: string | null
          flat_panic_rental?: string | null
          fleet_number?: string | null
          fm_unit?: string | null
          fm_unit_rental?: string | null
          fm_unit_sub?: string | null
          fuel_probe_1?: string | null
          fuel_probe_2?: string | null
          gps?: string | null
          gps_rental?: string | null
          group_name?: string | null
          gsm?: string | null
          gsm_rental?: string | null
          harness_7m_for_probe?: string | null
          harness_7m_for_probe_rental?: string | null
          id?: number
          idata?: string | null
          idata_rental?: string | null
          industrial_panic?: string | null
          industrial_panic_rental?: string | null
          ip_address?: string | null
          keypad?: string | null
          keypad_rental?: string | null
          keypad_waterproof?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          main_fm_harness?: string | null
          main_fm_harness_rental?: string | null
          maintenance?: string | null
          make?: string | null
          mdvr_4ch?: string | null
          mdvr_4ch_rental?: string | null
          mdvr_4ch_sub?: string | null
          mdvr_5ch?: string | null
          mdvr_5ch_rental?: string | null
          mdvr_5ch_sub?: string | null
          mdvr_8ch?: string | null
          mdvr_8ch_rental?: string | null
          mdvr_8ch_sub?: string | null
          mic?: string | null
          mic_rental?: string | null
          model?: string | null
          new_account_number: string
          new_registration?: string | null
          pfk_10m?: string | null
          pfk_10m_rental?: string | null
          pfk_15m?: string | null
          pfk_15m_rental?: string | null
          pfk_20m?: string | null
          pfk_20m_rental?: string | null
          pfk_5m?: string | null
          pfk_5m_rental?: string | null
          pfk_corpconnect_data_number?: string | null
          pfk_corpconnect_sim_number?: string | null
          pfk_dome_1?: string | null
          pfk_dome_1_rental?: string | null
          pfk_dome_2?: string | null
          pfk_dome_2_rental?: string | null
          pfk_driver_facing?: string | null
          pfk_driver_facing_rental?: string | null
          pfk_main_unit?: string | null
          pfk_main_unit_rental?: string | null
          pfk_main_unit_sub?: string | null
          pfk_road_facing?: string | null
          pfk_road_facing_rental?: string | null
          products?: Json[]
          roaming?: string | null
          roller_door_switches?: string | null
          roller_door_switches_rental?: string | null
          sd_card_1tb?: string | null
          sd_card_1tb_rental?: string | null
          sd_card_250gb?: string | null
          sd_card_250gb_rental?: string | null
          sd_card_256gb?: string | null
          sd_card_256gb_rental?: string | null
          sd_card_2tb?: string | null
          sd_card_2tb_rental?: string | null
          sd_card_480gb?: string | null
          sd_card_480gb_rental?: string | null
          sd_card_512gb?: string | null
          sd_card_512gb_rental?: string | null
          sim_card_number?: string | null
          sim_id?: string | null
          single_probe_rental?: string | null
          single_probe_sub?: string | null
          sky_ican?: string | null
          sky_ican_rental?: string | null
          sky_idata?: string | null
          sky_idata_rental?: string | null
          sky_on_batt_ign_rental?: string | null
          sky_on_batt_ign_unit_ip?: string | null
          sky_on_batt_ign_unit_serial_number?: string | null
          sky_on_batt_sub?: string | null
          sky_safety?: string | null
          sky_scout_12v_ip?: string | null
          sky_scout_12v_rental?: string | null
          sky_scout_12v_serial_number?: string | null
          sky_scout_12v_sub?: string | null
          sky_scout_24v_ip?: string | null
          sky_scout_24v_rental?: string | null
          sky_scout_24v_serial_number?: string | null
          sky_scout_24v_sub?: string | null
          skylink_data_number?: string | null
          skylink_pro_ip?: string | null
          skylink_pro_rental?: string | null
          skylink_pro_serial_number?: string | null
          skylink_pro_sub?: string | null
          skylink_sim_card_no?: string | null
          skylink_trailer_sub?: string | null
          skylink_trailer_unit_ip?: string | null
          skylink_trailer_unit_rental?: string | null
          skylink_trailer_unit_serial_number?: string | null
          skylink_voice_kit_ip?: string | null
          skylink_voice_kit_rental?: string | null
          skylink_voice_kit_serial_number?: string | null
          skylink_voice_kit_sub?: string | null
          speaker?: string | null
          speaker_rental?: string | null
          t_piece?: string | null
          t_piece_rental?: string | null
          tag?: string | null
          tag_reader?: string | null
          tag_reader_rental?: string | null
          tag_reader_rental_2?: string | null
          tag_rental?: string | null
          tag_rental_2?: string | null
          total_rental?: string | null
          total_rental_sub?: string | null
          total_sub?: string | null
          vin_number?: string | null
          vw_100ip_driver_facing_ip?: string | null
          vw_100ip_driver_facing_rental?: string | null
          vw300_dakkie_dome_1?: string | null
          vw300_dakkie_dome_1_rental?: string | null
          vw300_dakkie_dome_2?: string | null
          vw300_dakkie_dome_2_rental?: string | null
          vw303_driver_facing_camera?: string | null
          vw303_driver_facing_camera_rental?: string | null
          vw306_dvr_road_facing_for_4ch_8ch?: string | null
          vw306_dvr_road_facing_for_4ch_8ch_rental?: string | null
          vw306m_a2_dash_cam?: string | null
          vw306m_a2_dash_cam_rental?: string | null
          vw400_dome_1?: string | null
          vw400_dome_1_rental?: string | null
          vw400_dome_2?: string | null
          vw400_dome_2_rental?: string | null
          vw502_dual_lens_camera?: string | null
          vw502_dual_lens_camera_rental?: string | null
          vw502f_road_facing_camera?: string | null
          vw502f_road_facing_camera_rental?: string | null
          year?: string | null
        }
        Update: {
          a2_dash_cam?: string | null
          a2_dash_cam_rental?: string | null
          a2_mec_5?: string | null
          a2_mec_5_rental?: string | null
          a3_dash_cam_ai?: string | null
          a3_dash_cam_ai_rental?: string | null
          account_number?: string | null
          account_number_2?: string | null
          active?: boolean | null
          adas_02_road_facing?: string | null
          adas_02_road_facing_rental?: string | null
          after_hours?: string | null
          beame_1?: string | null
          beame_1_rental?: string | null
          beame_1_sub?: string | null
          beame_2?: string | null
          beame_2_rental?: string | null
          beame_2_sub?: string | null
          beame_3?: string | null
          beame_3_rental?: string | null
          beame_3_sub?: string | null
          beame_4?: string | null
          beame_4_rental?: string | null
          beame_4_sub?: string | null
          beame_5?: string | null
          beame_5_rental?: string | null
          beame_5_sub?: string | null
          branch?: string | null
          breathaloc?: string | null
          breathaloc_rental?: string | null
          buzzer?: string | null
          buzzer_rental?: string | null
          cable_10m_for_camera_4pin?: string | null
          cable_10m_for_camera_4pin_rental?: string | null
          cable_5m_6pin?: string | null
          cable_5m_6pin_rental?: string | null
          cable_5m_for_camera_4pin?: string | null
          cable_5m_for_camera_4pin_rental?: string | null
          cia?: string | null
          cia_rental?: string | null
          colour?: string | null
          comment?: string | null
          company?: string | null
          consultancy?: string | null
          controlroom?: string | null
          corpconnect_data_no?: string | null
          corpconnect_sim_no?: string | null
          cost_code?: string | null
          data_number?: string | null
          dms01_driver_facing?: string | null
          dms01_driver_facing_rental?: string | null
          dual_probe_rental?: string | null
          dual_probe_sub?: string | null
          early_warning?: string | null
          early_warning_rental?: string | null
          engine?: string | null
          extension_cable_1m?: string | null
          extension_cable_1m_rental?: string | null
          extension_cable_3m?: string | null
          extension_cable_3m_rental?: string | null
          flat_panic?: string | null
          flat_panic_rental?: string | null
          fleet_number?: string | null
          fm_unit?: string | null
          fm_unit_rental?: string | null
          fm_unit_sub?: string | null
          fuel_probe_1?: string | null
          fuel_probe_2?: string | null
          gps?: string | null
          gps_rental?: string | null
          group_name?: string | null
          gsm?: string | null
          gsm_rental?: string | null
          harness_7m_for_probe?: string | null
          harness_7m_for_probe_rental?: string | null
          id?: number
          idata?: string | null
          idata_rental?: string | null
          industrial_panic?: string | null
          industrial_panic_rental?: string | null
          ip_address?: string | null
          keypad?: string | null
          keypad_rental?: string | null
          keypad_waterproof?: string | null
          loan?: boolean | null
          loan_return_date?: string | null
          main_fm_harness?: string | null
          main_fm_harness_rental?: string | null
          maintenance?: string | null
          make?: string | null
          mdvr_4ch?: string | null
          mdvr_4ch_rental?: string | null
          mdvr_4ch_sub?: string | null
          mdvr_5ch?: string | null
          mdvr_5ch_rental?: string | null
          mdvr_5ch_sub?: string | null
          mdvr_8ch?: string | null
          mdvr_8ch_rental?: string | null
          mdvr_8ch_sub?: string | null
          mic?: string | null
          mic_rental?: string | null
          model?: string | null
          new_account_number?: string
          new_registration?: string | null
          pfk_10m?: string | null
          pfk_10m_rental?: string | null
          pfk_15m?: string | null
          pfk_15m_rental?: string | null
          pfk_20m?: string | null
          pfk_20m_rental?: string | null
          pfk_5m?: string | null
          pfk_5m_rental?: string | null
          pfk_corpconnect_data_number?: string | null
          pfk_corpconnect_sim_number?: string | null
          pfk_dome_1?: string | null
          pfk_dome_1_rental?: string | null
          pfk_dome_2?: string | null
          pfk_dome_2_rental?: string | null
          pfk_driver_facing?: string | null
          pfk_driver_facing_rental?: string | null
          pfk_main_unit?: string | null
          pfk_main_unit_rental?: string | null
          pfk_main_unit_sub?: string | null
          pfk_road_facing?: string | null
          pfk_road_facing_rental?: string | null
          products?: Json[]
          roaming?: string | null
          roller_door_switches?: string | null
          roller_door_switches_rental?: string | null
          sd_card_1tb?: string | null
          sd_card_1tb_rental?: string | null
          sd_card_250gb?: string | null
          sd_card_250gb_rental?: string | null
          sd_card_256gb?: string | null
          sd_card_256gb_rental?: string | null
          sd_card_2tb?: string | null
          sd_card_2tb_rental?: string | null
          sd_card_480gb?: string | null
          sd_card_480gb_rental?: string | null
          sd_card_512gb?: string | null
          sd_card_512gb_rental?: string | null
          sim_card_number?: string | null
          sim_id?: string | null
          single_probe_rental?: string | null
          single_probe_sub?: string | null
          sky_ican?: string | null
          sky_ican_rental?: string | null
          sky_idata?: string | null
          sky_idata_rental?: string | null
          sky_on_batt_ign_rental?: string | null
          sky_on_batt_ign_unit_ip?: string | null
          sky_on_batt_ign_unit_serial_number?: string | null
          sky_on_batt_sub?: string | null
          sky_safety?: string | null
          sky_scout_12v_ip?: string | null
          sky_scout_12v_rental?: string | null
          sky_scout_12v_serial_number?: string | null
          sky_scout_12v_sub?: string | null
          sky_scout_24v_ip?: string | null
          sky_scout_24v_rental?: string | null
          sky_scout_24v_serial_number?: string | null
          sky_scout_24v_sub?: string | null
          skylink_data_number?: string | null
          skylink_pro_ip?: string | null
          skylink_pro_rental?: string | null
          skylink_pro_serial_number?: string | null
          skylink_pro_sub?: string | null
          skylink_sim_card_no?: string | null
          skylink_trailer_sub?: string | null
          skylink_trailer_unit_ip?: string | null
          skylink_trailer_unit_rental?: string | null
          skylink_trailer_unit_serial_number?: string | null
          skylink_voice_kit_ip?: string | null
          skylink_voice_kit_rental?: string | null
          skylink_voice_kit_serial_number?: string | null
          skylink_voice_kit_sub?: string | null
          speaker?: string | null
          speaker_rental?: string | null
          t_piece?: string | null
          t_piece_rental?: string | null
          tag?: string | null
          tag_reader?: string | null
          tag_reader_rental?: string | null
          tag_reader_rental_2?: string | null
          tag_rental?: string | null
          tag_rental_2?: string | null
          total_rental?: string | null
          total_rental_sub?: string | null
          total_sub?: string | null
          vin_number?: string | null
          vw_100ip_driver_facing_ip?: string | null
          vw_100ip_driver_facing_rental?: string | null
          vw300_dakkie_dome_1?: string | null
          vw300_dakkie_dome_1_rental?: string | null
          vw300_dakkie_dome_2?: string | null
          vw300_dakkie_dome_2_rental?: string | null
          vw303_driver_facing_camera?: string | null
          vw303_driver_facing_camera_rental?: string | null
          vw306_dvr_road_facing_for_4ch_8ch?: string | null
          vw306_dvr_road_facing_for_4ch_8ch_rental?: string | null
          vw306m_a2_dash_cam?: string | null
          vw306m_a2_dash_cam_rental?: string | null
          vw400_dome_1?: string | null
          vw400_dome_1_rental?: string | null
          vw400_dome_2?: string | null
          vw400_dome_2_rental?: string | null
          vw502_dual_lens_camera?: string | null
          vw502_dual_lens_camera_rental?: string | null
          vw502f_road_facing_camera?: string | null
          vw502f_road_facing_camera_rental?: string | null
          year?: string | null
        }
        Relationships: []
      }
      vehiclesc: {
        Row: {
          boarding_km_hours: number | null
          colour: string
          company_id: number | null
          cost_centres: string | null
          created_at: string | null
          created_by: string | null
          driver_id: number | null
          engine_number: string | null
          expected_boarding_date: string | null
          fuel_type: string | null
          id: number
          inspected: boolean | null
          license_expiry_date: string | null
          make: string | null
          manufactured_year: string
          model: string
          purchase_price: number | null
          register_number: string | null
          registration_date: string | null
          registration_number: string
          retail_price: number | null
          service_intervals: string
          status: string | null
          sub_model: string | null
          take_on_kilometers: number
          tank_capacity: number | null
          tech_id: number | null
          transmission_type: string | null
          type: string | null
          updated_at: string | null
          vehicle_priority: string | null
          vehicle_type: string
          vin_number: string | null
          workshop_id: string | null
        }
        Insert: {
          boarding_km_hours?: number | null
          colour: string
          company_id?: number | null
          cost_centres?: string | null
          created_at?: string | null
          created_by?: string | null
          driver_id?: number | null
          engine_number?: string | null
          expected_boarding_date?: string | null
          fuel_type?: string | null
          id?: number
          inspected?: boolean | null
          license_expiry_date?: string | null
          make?: string | null
          manufactured_year: string
          model: string
          purchase_price?: number | null
          register_number?: string | null
          registration_date?: string | null
          registration_number: string
          retail_price?: number | null
          service_intervals: string
          status?: string | null
          sub_model?: string | null
          take_on_kilometers: number
          tank_capacity?: number | null
          tech_id?: number | null
          transmission_type?: string | null
          type?: string | null
          updated_at?: string | null
          vehicle_priority?: string | null
          vehicle_type?: string
          vin_number?: string | null
          workshop_id?: string | null
        }
        Update: {
          boarding_km_hours?: number | null
          colour?: string
          company_id?: number | null
          cost_centres?: string | null
          created_at?: string | null
          created_by?: string | null
          driver_id?: number | null
          engine_number?: string | null
          expected_boarding_date?: string | null
          fuel_type?: string | null
          id?: number
          inspected?: boolean | null
          license_expiry_date?: string | null
          make?: string | null
          manufactured_year?: string
          model?: string
          purchase_price?: number | null
          register_number?: string | null
          registration_date?: string | null
          registration_number?: string
          retail_price?: number | null
          service_intervals?: string
          status?: string | null
          sub_model?: string | null
          take_on_kilometers?: number
          tank_capacity?: number | null
          tech_id?: number | null
          transmission_type?: string | null
          type?: string | null
          updated_at?: string | null
          vehicle_priority?: string | null
          vehicle_type?: string
          vin_number?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehiclesc_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehiclesc_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      comprehensive_monthly_summary: {
        Row: {
          avg_adjusted_premium: number | null
          avg_performance_rating: number | null
          claims_3_years: number | null
          created_at: string | null
          loss_ratio: number | null
          month: number | null
          monthly_premium: number | null
          overall_risk_score: number | null
          total_claims_processed: number | null
          total_drivers_with_premiums: number | null
          total_fleet_value: number | null
          total_kilometres: number | null
          total_reward_amount: number | null
          total_vehicle_rewards: number | null
          year: number | null
        }
        Relationships: []
      }
      cron_job_schedule_help: {
        Row: {
          active: boolean | null
          command: string | null
          description: string | null
          jobname: string | null
          schedule: string | null
        }
        Insert: {
          active?: boolean | null
          command?: string | null
          description?: never
          jobname?: string | null
          schedule?: string | null
        }
        Update: {
          active?: boolean | null
          command?: string | null
          description?: never
          jobname?: string | null
          schedule?: string | null
        }
        Relationships: []
      }
      driver_performance_trends: {
        Row: {
          adjusted_performance_rating: number | null
          adjusted_premium: number | null
          adjustment_amount: number | null
          base_premium: number | null
          driver_id: string | null
          driver_name: string | null
          is_low_performance: boolean | null
          month: number | null
          performance_rating: number | null
          plate: string | null
          prev_adjusted_premium: number | null
          prev_performance_rating: number | null
          year: number | null
        }
        Relationships: []
      }
      monthly_premium_summary: {
        Row: {
          avg_adjusted_performance_rating: number | null
          avg_performance_rating: number | null
          low_performance_drivers: number | null
          month: number | null
          total_adjusted_premium: number | null
          total_adjustment_amount: number | null
          total_base_premium: number | null
          total_drivers: number | null
          year: number | null
        }
        Relationships: []
      }
      payments_dashboard: {
        Row: {
          balance_due: number | null
          company: string | null
          cost_code: string | null
          invoice_count: number | null
          last_due_date: string | null
          last_invoice_date: string | null
          overdue_30_days: number | null
          overdue_60_days: number | null
          overdue_90_days: number | null
          payment_status: string | null
          total_due: number | null
          total_paid: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_monthly_billing: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_premium_with_tolerance: {
        Args: {
          p_base_premium: number
          p_efficiency: number
          p_safety_score: number
          p_tolerance_percentage?: number
        }
        Returns: {
          adjusted_performance_rating: number
          adjusted_premium: number
          adjustment_amount: number
          adjustment_percentage: number
          is_low_performance: boolean
          performance_rating: number
        }[]
      }
      generate_job_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quotation_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_available_months: {
        Args: Record<PropertyKey, never>
        Returns: {
          has_fleet_stats: boolean
          has_premiums: boolean
          has_rewards: boolean
          has_summaries: boolean
          month_val: number
          record_count: number
          year_val: number
        }[]
      }
      get_month_summary: {
        Args: { target_month: number; target_year: number }
        Returns: {
          fleet_stats: Json
          premium_data: Json
          rewards_data: Json
          summary_data: Json
        }[]
      }
      get_payments_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          balance_due: number
          company: string
          cost_code: string
          last_invoice_date: string
          overdue_30: number
          overdue_60: number
          overdue_90: number
          payment_status: string
          total_due: number
          total_paid: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      insert_monthly_premiums: {
        Args: {
          p_base_premium: number
          p_driver_data: Json
          p_month: number
          p_tolerance_percentage?: number
          p_year: number
        }
        Returns: undefined
      }
      monthly_billing_process: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_loan_vehicles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      trigger_monthly_billing: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      update_overdue_amounts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_payment_months: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_payment_months_once: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_payments_on_22nd: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
