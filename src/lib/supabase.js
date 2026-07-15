import { createClient } from "@supabase/supabase-js";

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = (url) => {
  return url && (url.startsWith("http://") || url.startsWith("https://"));
};

if (!isValidUrl(supabaseUrl)) {
  if (supabaseUrl && supabaseUrl !== "your_supabase_project_url") {
    console.warn(`Supabase URL "${supabaseUrl}" is invalid. Using fallback.`);
  }
  supabaseUrl = "https://placeholder-project-id.supabase.co";
}

if (!supabaseAnonKey || supabaseAnonKey === "your_supabase_anon_key") {
  supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key"; // standard JWT-like format
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
