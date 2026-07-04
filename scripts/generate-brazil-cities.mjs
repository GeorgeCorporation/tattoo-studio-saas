import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const IBGE_STATES_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/estados";
const OUTPUT_PATH = join(process.cwd(), "src", "lib", "brazil-cities.json");

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Falha ao buscar ${url}: ${response.status}`);
  }

  return response.json();
}

async function main() {
  const states = await fetchJson(IBGE_STATES_URL);
  const sortedStates = [...states].sort((a, b) => a.sigla.localeCompare(b.sigla, "pt-BR"));

  const entries = await Promise.all(
    sortedStates.map(async (state) => {
      const cities = await fetchJson(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state.sigla}/municipios`,
      );

      const names = cities
        .map((city) => city.nome)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "pt-BR"));

      return [state.sigla, names];
    }),
  );

  const payload = Object.fromEntries(entries);
  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Arquivo gerado em ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
