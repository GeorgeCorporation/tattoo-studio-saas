import { beforeEach, describe, expect, it, vi } from "vitest";

type FromCall = {
  table: string;
  action?: "select" | "insert" | "update";
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
      resolve({ data: slugExists ? [{ id: `${table}-existing` }] : [], error: null }),
  };

  calls.push({ table, action: "select" });
  return builder;
}

function createUpdateBuilder(table: string, payload: unknown) {
  const builder = {
    eq: vi.fn(() => Promise.resolve({ error: null })),
  };

  calls.push({ table, action: "update", payload });
  return builder;
}

function createInsertBuilder(table: string, payload: unknown) {
  calls.push({ table, action: "insert", payload });

  if (table === "working_hours" || table === "services") {
    return Promise.resolve({ error: null });
  }

  const builder = {
    select: vi.fn(() => builder),
    single: vi.fn(() =>
      Promise.resolve({
        data:
          table === "tattoo_artists"
            ? { id: "artist-new" }
            : { id: "studio-new", name: "Ideal Tattoo", slug: "ideal-tattoo" },
        error: null,
      }),
    ),
  };

  return builder;
}

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => createSelectBuilder(table)),
      insert: vi.fn((payload: unknown) => createInsertBuilder(table, payload)),
      update: vi.fn((payload: unknown) => createUpdateBuilder(table, payload)),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://cdn.test/file.png" } })),
      })),
    },
  },
}));

describe("createStudioOnboarding", () => {
  beforeEach(() => {
    calls.length = 0;
    existingStudio = null;
    slugExists = false;
  });

  it("retorna estúdio existente sem criar duplicado", async () => {
    existingStudio = { id: "studio-existing", name: "Studio Já Existe", slug: "studio-ja-existe" };
    const { createStudioOnboarding } = await import("@/services/onboarding.service");

    const result = await createStudioOnboarding({
      userId: "user-1",
      name: "Ideal Tattoo",
      slug: "ideal-tattoo",
      whatsapp: "11999999999",
      city: "São Paulo",
      state: "SP",
    });

    expect(result).toEqual(existingStudio);
    expect(calls.filter((call) => call.action === "insert")).toHaveLength(0);
  });

  it("cria estúdio, horários, tatuador e serviço inicial", async () => {
    const { createStudioOnboarding, buildDefaultWorkingHours } = await import("@/services/onboarding.service");

    const result = await createStudioOnboarding({
      userId: "user-1",
      name: " Ideal Tattoo ",
      slug: "Ideal Tattoo",
      description: " Estúdio premium ",
      whatsapp: "11999999999",
      instagram: "@idealtattoo",
      city: " São Paulo ",
      state: "SP",
      workingHours: buildDefaultWorkingHours(),
      firstArtist: {
        name: "George Tattoo",
        specialty: "Realismo",
        whatsapp: "11988887777",
      },
      firstService: {
        name: "Tatuagem pequena",
        category: "Fine Line",
        starting_price: 250,
        avg_duration_minutes: 120,
      },
    });

    const studioInsert = calls.find((call) => call.table === "studios" && call.action === "insert");
    const hoursInsert = calls.find((call) => call.table === "working_hours" && call.action === "insert");
    const artistInsert = calls.find((call) => call.table === "tattoo_artists" && call.action === "insert");
    const serviceInsert = calls.find((call) => call.table === "services" && call.action === "insert");

    expect(result).toMatchObject({ id: "studio-new", slug: "ideal-tattoo" });
    expect(studioInsert?.payload).toMatchObject({
      user_id: "user-1",
      name: "Ideal Tattoo",
      slug: "ideal-tattoo",
      description: "Estúdio premium",
      instagram: "@idealtattoo",
      city: "São Paulo",
    });
    expect(hoursInsert?.payload).toHaveLength(7);
    expect(artistInsert?.payload).toMatchObject({
      studio_id: "studio-new",
      name: "George Tattoo",
      specialty: "Realismo",
      is_active: true,
    });
    expect(serviceInsert?.payload).toMatchObject({
      studio_id: "studio-new",
      name: "Tatuagem pequena",
      category: "Fine Line",
      starting_price: 250,
      is_active: true,
    });
  });
});
