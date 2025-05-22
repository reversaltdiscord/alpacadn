/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // add other environment variables here, e.g.:
  // readonly VITE_ANOTHER_ENV_VARIABLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 