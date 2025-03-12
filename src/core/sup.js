import { createClient } from "@supabase/supabase-js";

const supURL = "https://jwylvnqdlbtbmxsencfu.supabase.co";

const supKEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3eWx2bnFkbGJ0Ym14c2VuY2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzc3NTk4OTUsImV4cCI6MTk5MzMzNTg5NX0.hT-vS_JdGLu4HlYAcZ1TEjRoN91oZw7QcxGUYTEW0z4";

const supabase = createClient(supURL, supKEY);

export default supabase;
