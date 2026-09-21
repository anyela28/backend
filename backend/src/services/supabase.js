import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log(
  "SERVICE KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20)
);

export default supabase;