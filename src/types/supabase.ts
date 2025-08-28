import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvknlwcaneohakgrmqwr.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2a25sd2NhbmVvaGFrZ3JtcXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzIzOTgsImV4cCI6MjA2OTYwODM5OH0.TYTNCTGGFF0Lar1DF8nv49ChJgHEt4bOOuLA9i2K5is';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Database {
  public: {
    Tables: Record<string, any>;
    Views: Record<string, any>;
    Functions: Record<string, any>;
    Enums: Record<string, any>;
  };
}
