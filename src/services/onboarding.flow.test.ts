import { beforeEach, describe, expect, it, vi } from "vitest";

type TableCall = {
  table: string;
  action: "select" | "insert" | "update";
  payload?: unknown;
};

const calls: TableCall[] = [];
let studioRow: Record<string, unknown> | null = null;
let workingHoursRows: Array<Record<string, unknown>> = [];
let artistRows: Array<Record<string, unknown>> = [];
let serviceRows: Array<Record<string, unknown>> = [];
let studioSlugExists = false;

function selectResultFor(table: string) {
  if (table === "studios") return studioRow;
  if (table === "working_hours") return workingHoursRows;
  if (table === "tattoo_artists") return artistRows;
  if (table === "services") return serviceRows;
  return [];
}

function createSelectBuilder(table: string) {
  const builder = {
    eq: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    order: vi.fn(() => builder),
    returns: vi.fn(() => Promise.resolve({ data: selectResultFor(table), error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: table === "studios" ? studioRow : null, error: null })),
    then: (resolve: (value: { data: Array<{ id: string }>; error: null }) => void) =>
      resolve({
        data: studioSlugExists ? [{ id: "existing-slug" }] : [],
        error: null,
      }),
  };

  calls.push({ table, action: "select" });
  return builder;
}

function createUpdateBuilder(table: string, payload: unknown) {
  const builder = {
    eq: vi.fn(() => {
      calls.push({ table, action: "update", payload });
      return builder;
    }),
    select: vi.fn(() => builder),
    single: vi.fn(() =>
      Promise.resolve({
        data: {
          id: "studio-1",
          name: "Inkora",
          slug: "inkora",
          logo_url: null,
          description: "Estúdio premium",
          whatsapp: "11999999999",
          instagram: "@inkora",
          website: null,
          address: null,
          city: "São Paulo",
          state: "SP",
        },
        error: null,
      }),
    ),
  };

  return builder;
}

function createInsertBuilder(table: string, payload: unknown) {
  calls.push({ table, action: "insert", payload });

  if (table === "working_hours") {
    return Promise.resolve({ error: null });
  }

  const builder = {
    select: vi.fn(() => builder),
    single: vi.fn(() => {
      if (table === "studios") {
        return Promise.resolve({
          data: {
            id: "studio-1",
            name: "Inkora",
            slug: "inkora",
            logo_url: null,
            description: "Estúdio premium",
            whatsapp: "11999999999",
            instagram: "@inkora",
            website: null,
            address: null,
            city: "São Paulo",
            state: "SP",
          },
          error: null,
        });
      }

      if (table === "tattoo_artists") {
        return Promise.resolve({
          data: { id: "artist-1", photo_url: null },
          error: null,
        });
      }

      if (table === "services") {
        return Promise.resolve({
          data: { id: "service-1" },
          error: null,
        });
      }

      return Promise.resolve({ data: null, error: null });
    }),
  };

  return builder;
}

vi.mock("@/services/studio-brand.service", () => ({
  replaceStudioLogo: vi.fn(() => Promise.resolve({ logoUrl: "https://cdn.test/logo.png", removalWarning: null })),
}));

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
    studioRow = null;
    workingHoursRows = [];
    artistRows = [];
    serviceRows = [];
    studioSlugExists = false;
  });

  it("cria estúdio, horários, tatuador e serviço inicial", async () => {
    const { buildDefaultWorkingHours, createStudioOnboarding } = await import("@/services/onboarding.service");

    const result = await createStudioOnboarding({
      userId: "user-1",
      name: " Inkora ",
      slug: "Inkora",
      description: " Estúdio premium ",
      whatsapp: "11999999999",
      instagram: "@inkora",
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

    expect(result).toMatchObject({ id: "studio-1", slug: "inkora" });
    expect(calls.find((call) => call.table === "studios" && call.action === "insert")?.payload).toMatchObject({
      user_id: "user-1",
      name: "Inkora",
      slug: "inkora",
      description: "Estúdio premium",
      instagram: "@inkora",
      city: "São Paulo",
    });
    expect(calls.find((call) => call.table === "working_hours" && call.action === "insert")?.payload).toBeTruthy();
    expect(calls.find((call) => call.table === "tattoo_artists" && call.action === "insert")?.payload).toMatchObject({
      studio_id: "studio-1",
      name: "George Tattoo",
      specialty: "Realismo",
      is_active: true,
    });
    expect(calls.find((call) => call.table === "services" && call.action === "insert")?.payload).toMatchObject({
      studio_id: "studio-1",
      name: "Tatuagem pequena",
      category: "Fine Line",
      starting_price: 250,
      is_active: true,
    });
  });

  it("retoma setup parcial sem criar outro estúdio", async () => {
    studioRow = {
      id: "studio-1",
      name: "Inkora",
      slug: "inkora",
      logo_url: null,
      description: null,
      whatsapp: "11999999999",
      instagram: null,
      website: null,
      address: null,
      city: "São Paulo",
      state: "SP",
    };

    const { buildDefaultWorkingHours, createStudioOnboarding } = await import("@/services/onboarding.service");

    await createStudioOnboarding({
      userId: "user-1",
      name: "Inkora",
      slug: "inkora",
      whatsapp: "11999999999",
      city: "São Paulo",
      state: "SP",
      workingHours: buildDefaultWorkingHours(),
      firstArtist: {
        name: "George Tattoo",
      },
      firstService: {
        name: "Tatuagem pequena",
      },
    });

    expect(calls.filter((call) => call.table === "studios" && call.action === "insert")).toHaveLength(0);
    expect(calls.filter((call) => call.table === "studios" && call.action === "update")).not.toHaveLength(0);
    expect(calls.find((call) => call.table === "tattoo_artists" && call.action === "insert")).toBeTruthy();
    expect(calls.find((call) => call.table === "services" && call.action === "insert")).toBeTruthy();
  });
});
