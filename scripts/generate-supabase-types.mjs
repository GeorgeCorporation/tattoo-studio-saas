import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const outputFile = "src/types/database.types.ts";

async function readEnvExample() {
  try {
    return await readFile(".env", "utf8");
  } catch {
    try {
      return await readFile(".env.example", "utf8");
    } catch {
      return "";
    }
  }
}

function readEnvValue(content, key) {
  const line = content
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${key}=`));

  return line?.slice(key.length + 1).trim();
}

function projectIdFromUrl(value) {
  if (!value || value.includes("SUA_URL_AQUI")) return "";

  try {
    return new URL(value).hostname.split(".")[0];
  } catch {
    return "";
  }
}

async function main() {
  const envContent = await readEnvExample();
  const projectId =
    process.env.SUPABASE_PROJECT_ID ||
    projectIdFromUrl(process.env.VITE_SUPABASE_URL || readEnvValue(envContent, "VITE_SUPABASE_URL"));

  if (!projectId) {
    throw new Error(
      "SUPABASE_PROJECT_ID nao encontrado. Configure SUPABASE_PROJECT_ID ou VITE_SUPABASE_URL antes de rodar npm run db:types.",
    );
  }

  const { stdout } = await execFileAsync(
    process.execPath,
    [
      "node_modules/supabase/dist/supabase.js",
      "gen",
      "types",
      "typescript",
      "--project-id",
      projectId,
      "--schema",
      "public",
    ],
    {
      maxBuffer: 1024 * 1024 * 10,
    },
  );

  await writeFile(outputFile, stdout);
  console.log(`Tipos Supabase atualizados em ${outputFile}`);
}

main().catch((error) => {
  console.error(error.stderr || error.stdout || error.message);
  console.error("Se faltar login, rode: npx supabase login");
  process.exit(1);
});
