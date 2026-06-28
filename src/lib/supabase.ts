import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ejvwjrbifcclmpgjtayg.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdndqcmJpZmNjbG1wZ2p0YXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjM0NzYsImV4cCI6MjA5ODIzOTQ3Nn0.mkgbtc8pM434wboUPXkys22b3eyppyRhHoV5mxNGV8c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
