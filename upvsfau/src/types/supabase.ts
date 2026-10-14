export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      programs: { Row: { id: string; slug: string; name: string; summary: string; description: string | null; publication_status: "draft" | "published" | "archived"; featured: boolean; display_priority: number | null; eligibility: string[] | null; requirements: string[] | null; benefits: string[] | null; degree_programs: string[] | null; application_process: string[] | null; contact: Json | null; official_source_url: string | null; source_status: string | null; archived_at: string | null; created_at: string; updated_at: string }; Insert: never; Update: never; Relationships: [] };
      service_categories: { Row: { id: string; slug: string; name: string; description: string; created_at: string }; Insert: never; Update: never; Relationships: [] };
      program_category_links: { Row: { program_id: string; category_id: string; archived_at: string | null }; Insert: never; Update: never; Relationships: [] };
      scholarship_categories: { Row: { id: string; slug: "up-administered" | "government" | "private"; name: string }; Insert: never; Update: never; Relationships: [] };
      application_cycles: { Row: { id: string; program_id: string; academic_year: string | null; cycle_label: string | null; verified_open_at: string | null; close_at: string | null; external_url: string | null; link_type: "official-portal" | "google-form" | "other" | null; verification_state: "unverified" | "verified"; verification_metadata: Json | null; admin_override: "upcoming" | "open" | "closed" | "suspended" | null; archived_at: string | null }; Insert: never; Update: never; Relationships: [] };
      announcements: { Row: { id: string; title: string; summary: string; body: string | null; publication_status: "draft" | "published" | "archived"; scheduled_at: string | null; pinned: boolean; author_id: string | null; archived_at: string | null; created_at: string; updated_at: string }; Insert: never; Update: never; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
