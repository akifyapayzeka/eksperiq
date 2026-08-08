const required = process.argv.includes("--required") || process.env.SUPABASE_REQUIRED === "true";

const publicVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const serverVars = ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_DATABASE_URL"];
const allVars = [...publicVars, ...serverVars];

const missing = allVars.filter((name) => !process.env[name]?.trim());

function printResult(message) {
  process.stdout.write(`${message}\n`);
}

if (missing.length > 0) {
  const message = `Supabase env eksik: ${missing.join(", ")}`;

  if (required) {
    process.stderr.write(`${message}\n`);
    process.exit(1);
  }

  printResult(`${message}. Development icin opsiyonel; production/TestFlight icin tamamlanmali.`);
  process.exit(0);
}

let parsedUrl;
try {
  parsedUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
} catch {
  process.stderr.write("NEXT_PUBLIC_SUPABASE_URL gecerli bir URL degil.\n");
  process.exit(1);
}

const allowedHosts = [".supabase.co", "localhost", "127.0.0.1"];
const hostAllowed = allowedHosts.some((host) =>
  host.startsWith(".") ? parsedUrl.hostname.endsWith(host) : parsedUrl.hostname === host,
);

if (!hostAllowed) {
  process.stderr.write("NEXT_PUBLIC_SUPABASE_URL Supabase veya local development hostu gibi gorunmuyor.\n");
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith("eyJ")) {
  process.stderr.write("NEXT_PUBLIC_SUPABASE_ANON_KEY JWT formatinda gorunmuyor.\n");
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith("eyJ")) {
  process.stderr.write("SUPABASE_SERVICE_ROLE_KEY JWT formatinda gorunmuyor.\n");
  process.exit(1);
}

printResult("Supabase env kontrati tamam.");
