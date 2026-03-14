/**
 * Minimal Supabase database types so the client accepts insert/update payloads.
 * For full type safety, generate with: npx supabase gen types typescript --project-id YOUR_REF > src/types/supabase.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableRow = Record<string, unknown>;
/** Per-object type so Supabase client accepts update/insert; Record<string, unknown> can infer as never. */
type TableMutation = { [key: string]: unknown };

export interface Database {
  public: {
    Tables: {
      user: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      borrower: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      lender: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      capital_pool: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      investment: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      deal: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      property: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      deal_stage_history: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      scenario: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      match_run: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      lender_match_snapshot: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      calendar_event: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      loan: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      loan_payment: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      loan_fee: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      note: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      doc_request: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      document_file: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      deal_condition: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      task: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      deal_activity: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      notification: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
      brokerage_settings: { Row: TableRow; Insert: TableMutation; Update: TableMutation };
    };
    Views: { [_ in string]: never };
    Functions: { [_ in string]: never };
    Enums: { [_ in string]: never };
  };
}

export type TableName = keyof Database['public']['Tables'];
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];
