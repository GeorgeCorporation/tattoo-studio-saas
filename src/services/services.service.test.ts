import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: mocks.from,
  },
}));

import { createService, updateService } from "@/services/services.service";

describe("services.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockReturnValue({ insert: mocks.insert, update: mocks.update });
    mocks.insert.mockResolvedValue({ error: null });
  });

  it("cria serviço com o payload atual", async () => {
    await createService({
      studioId: "studio-1",
      name: "Fine line",
      description: "Traço delicado",
      startingPrice: 0,
      durationMinutes: 30,
    });

    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(Object.keys(mocks.insert.mock.calls[0][0])).toEqual([
      "studio_id",
      "name",
      "description",
      "starting_price",
      "avg_duration_minutes",
      "is_active",
    ]);
  });

  it("rejeita preço negativo antes de chamar o Supabase", async () => {
    const invalidInput = {
      name: "Fine line",
      startingPrice: -1,
      durationMinutes: 30,
    };

    await expect(createService({ studioId: "studio-1", ...invalidInput })).rejects.toThrow(/preço inicial válido/i);
    await expect(updateService("service-1", invalidInput)).rejects.toThrow(/preço inicial válido/i);

    expect(mocks.from).not.toHaveBeenCalled();
  });
});
