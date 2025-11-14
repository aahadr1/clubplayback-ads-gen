import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      generations: {
        Row: {
          id: string;
          user_id: string;
          prompt: string;
          image_inputs: string[] | null;
          aspect_ratio: string | null;
          output_format: string | null;
          output_url: string;
          created_at: string;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          error_message: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt: string;
          image_inputs?: string[] | null;
          aspect_ratio?: string | null;
          output_format?: string | null;
          output_url?: string;
          created_at?: string;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          error_message?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt?: string;
          image_inputs?: string[] | null;
          aspect_ratio?: string | null;
          output_format?: string | null;
          output_url?: string;
          created_at?: string;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          error_message?: string | null;
        };
      };
    };
  };
};

export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Return a mock client for build time - will have real values in production
    const mockUrl = 'https://placeholder.supabase.co';
    const mockKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjE5NzE5OTksImV4cCI6MTkzNzU0Nzk5OX0.placeholder';
    return createBrowserClient<Database>(mockUrl, mockKey);
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
};

