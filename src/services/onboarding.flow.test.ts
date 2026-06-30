import { beforeEach, describe, expect, it, vi } from "vitest";

type FromCall = {
  table: string;
  action?: "select" | "insert";
  payload?: unknown;
};

const calls: FromCall[] = [];
let existingStudio: { id: string; name: string; slug: string } | null = null;
let slugExists = false;

function createSelectBuilder(table: string) {
  const builder = {
    eq: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve({ data: existingStudio, error: null })),
    then: (resolve: (value: { data: { id: string }[]; error: null }) => void) =>
      resolve({ data: slugExists ? [{ id: "studio-existing" }] : [], error: null }),
  };

  calls.push({ table, action: "select" });
  return builder;
}

function createInsertBuilder(table: string, payload: unknown) {
  const builder = {
    select: vi.fn(() => builder),
    single: vi.fn(() =>
      Promise.resolve({
        data: { id: "studio-new", name: "Ideal Tattoo", slug: "ideal-tattoo" },
        error: null,
      }),
    ),
  };

  calls.push({ table, action: "insert", payload });

  if (table === "working_hours") {
    return Promise.resolve({ error: null });
  }

  return builder;
}

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => createSelectBuilder(table)),
      insert: vi.fn((payload: unknown) => createInsertBuilder(table, payload)),
    })),
  },
}));

describe("createStudioOnboarding", () => {
  beforeEach(() => {
    calls.length = 0;
    existingStudio = null;
    slugExists = false;
  });

  it("retorna estudio existente sem criar duplicado", async () => {
    existingStudio = { id: "studio-existing", name: "Studio Ja Existe", slug: "studio-ja-existe" };
    const { createStudioOnboarding } = await import("@/services/onboarding.service");

    const result = await createStudioOnboarding({
      userId: "user-1",
      name: "Ideal Tattoo",
      slug: "ideal-tattoo",
      whatsapp: "11999999999",
      city: "Sao Paulo",
      state: "SP",
    });

    expect(result).toEqual(existingStudio);
    expect(calls.filter((call) => call.action === "insert")).toHaveLength(0);
  });

  it("cria estudio e 7 horarios padrao quando usuario nao tem estudio", async () => {
    const { createStudioOnboarding } = await import("@/services/onboarding.service");

    const result = await createStudioOnboarding({
      userId: "user-1",
      name: " Ideal Tattoo ",
      slug: "Ideal Tattoo",
      description: " Estudio premium ",
      whatsapp: "11999999999",
      instagram: "@idealtattoo",
      city: " Sao Paulo ",
      state: "SP",
    });

    const studioInsert = calls.find((call) => call.table === "studios" && call.action === "insert");
    const hoursInsert = calls.find((call) => call.table === "working_hours" && call.action === "insert");

    expect(result).toMatchObject({ id: "studio-new", slug: "ideal-tattoo" });
    expect(studioInsert?.payload).toMatchObject({
      user_id: "user-1",
      name: "Ideal Tattoo",
      slug: "ideal-tattoo",
      description: "Estudio premium",
      instagram: "@idealtattoo",
      city: "Sao Paulo",
    });
    expect(hoursInsert?.payload).toHaveLength(7);
  });
});
