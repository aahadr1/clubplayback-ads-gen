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
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

