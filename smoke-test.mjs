import { createClient } from "@supabase/supabase-js";

// Allow passing URL and KEY as arguments for immediate testing
const url = process.argv[2] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.argv[3] || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("--- BrokerBox Smoke Test ---");

if (!url || !key || url.includes("your-project")) {
  console.error("❌ ERROR: Missing or placeholder credentials.");
  console.log("USAGE: node smoke-test.mjs <SUPABASE_URL> <SUPABASE_ANON_KEY>");
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  console.log("Attempting connection to:", url);
  const { data, error, count } = await supabase
    .from("Deal")
    .select("*", { count: "estimated", head: true });
  
  if (error) {
    console.error("❌ SUPABASE CONNECTION FAILED:", error.message);
  } else {
    console.log("✅ SUPABASE CONNECTED SUCCESSFULLY!");
    console.log("Found deals in table 'Deal':", count);
  }
}
test();
