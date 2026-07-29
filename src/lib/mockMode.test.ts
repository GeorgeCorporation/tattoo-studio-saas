import { afterEach, describe, expect, it } from "vitest";
import { clearMockStudio, getMockDashboardStudio, getMockSetupStatus, saveMockStudio } from "@/lib/mockMode";

describe("mock onboarding state", () => {
  afterEach(() => clearMockStudio());

  it("mantém logo e dados de conclusão no mesmo estado persistido", () => {
    saveMockStudio({
      id: "mock-studio-1",
      name: "Ideal Tattoo",
      slug: "ideal-tattoo",
      logo_url: "data:image/png;base64,logo",
      workingHours: Array.from({ length: 7 }, (_, day) => ({
        day_of_week: day,
        open_time: day === 0 ? null : "09:00",
        close_time: day === 0 ? null : "18:00",
        is_open: day !== 0,
      })),
      artists: [{ id: "artist-1", name: "Ana", slug: "ana", specialty: null, instagram: null, whatsapp: null, photo_url: null }],
      services: [{ id: "service-1", name: "Fine Line", description: null, starting_price: null, avg_duration_minutes: 120 }],
    });

    expect(getMockDashboardStudio()).toMatchObject({
      name: "Ideal Tattoo",
      logo_url: "data:image/png;base64,logo",
    });
    expect(getMockSetupStatus()).toMatchObject({ hasLogo: true, artistsCount: 1, servicesCount: 1 });
  });
});
