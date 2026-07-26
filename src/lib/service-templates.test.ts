import { describe, expect, it } from "vitest";
import { SERVICE_TEMPLATES } from "@/lib/service-templates";

describe("SERVICE_TEMPLATES", () => {
  it("provides valid editable suggestions without price or category", () => {
    expect(SERVICE_TEMPLATES).toHaveLength(10);

    for (const template of SERVICE_TEMPLATES) {
      expect(template.id).toBeTruthy();
      expect(template.name.trim()).toBeTruthy();
      expect(template.description?.trim()).toBeTruthy();
      expect(Number.isInteger(template.durationMinutes)).toBe(true);
      expect(template.durationMinutes).toBeGreaterThanOrEqual(30);
      expect(template).not.toHaveProperty("startingPrice");
      expect(template).not.toHaveProperty("category");
    }
  });

  it("includes the approved initial models with their suggested durations", () => {
    expect(SERVICE_TEMPLATES.map(({ name, durationMinutes }) => ({ name, durationMinutes }))).toEqual([
      { name: "Fine Line", durationMinutes: 90 },
      { name: "Blackwork", durationMinutes: 180 },
      { name: "Old School", durationMinutes: 180 },
      { name: "Realismo", durationMinutes: 240 },
      { name: "Aquarela", durationMinutes: 240 },
      { name: "Cover Up", durationMinutes: 240 },
      { name: "Fechamento", durationMinutes: 300 },
      { name: "Lettering", durationMinutes: 90 },
      { name: "Minimalista", durationMinutes: 60 },
      { name: "Tribal", durationMinutes: 180 },
    ]);
  });
});
