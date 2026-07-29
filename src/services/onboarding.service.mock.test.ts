import { afterEach, describe, expect, it, vi } from "vitest";

async function loadMockOnboardingService() {
  vi.resetModules();
  localStorage.clear();
  localStorage.setItem("inkora:mock-mode", "true");

  return import("@/services/onboarding.service");
}

describe("onboarding.service em modo mock", () => {
  afterEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("persiste uma única fonte de verdade completa para concluir e reabrir onboarding", async () => {
    const { buildDefaultWorkingHours, createStudioOnboarding, getOnboardingProgress, getOnboardingSnapshot } =
      await loadMockOnboardingService();

    await createStudioOnboarding({
      userId: "mock-user-1",
      name: "Ideal Tattoo",
      slug: "ideal-tattoo",
      description: "Estúdio de teste",
      whatsapp: "11999999999",
      city: "São Paulo",
      state: "SP",
      logoFile: new File(["logo"], "logo.png", { type: "image/png" }),
      workingHours: buildDefaultWorkingHours(),
      firstArtists: [{ name: "Ana", slug: "ana" }],
      firstServices: [{ name: "Fine Line", description: "Linhas finas", avg_duration_minutes: 90 }],
    });

    const snapshot = await getOnboardingSnapshot("mock-user-1");

    expect(snapshot.studio).toMatchObject({
      name: "Ideal Tattoo",
      slug: "ideal-tattoo",
      logo_url: expect.stringMatching(/^data:image\/png;base64,/),
    });
    expect(snapshot.workingHours).toHaveLength(7);
    expect(snapshot.artists).toEqual([expect.objectContaining({ name: "Ana", slug: "ana" })]);
    expect(snapshot.services).toEqual([expect.objectContaining({ name: "Fine Line", avg_duration_minutes: 90 })]);
    expect(getOnboardingProgress(snapshot, true).canFinish).toBe(true);
  });
});
