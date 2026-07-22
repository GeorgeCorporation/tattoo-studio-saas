import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Settings } from "@/pages/dashboard/Settings";

type WorkingHourRow = {
  id: string;
  studio_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_open: boolean;
};

const mocks = vi.hoisted(() => ({
  updates: [] as Array<{ table: string; payload: unknown }>,
  workingHours: [] as WorkingHourRow[],
  user: { id: "user-1", email: "george@test.com" },
}));

const studio = {
  id: "studio-1",
  name: "Inkora",
  logo_url: null,
  description: null,
  whatsapp: "11999999999",
  instagram: null,
  website: null,
  address: null,
  city: "Sao Paulo",
  state: "SP",
};

function makeWorkingHours(): WorkingHourRow[] {
  return Array.from({ length: 7 }, (_, day) => ({
    id: `hour-${day}`,
    studio_id: "studio-1",
    day_of_week: day,
    open_time: day === 0 ? null : "09:00",
    close_time: day === 0 ? null : "18:00",
    is_open: day !== 0,
  }));
}

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: mocks.user,
    signOut: vi.fn(),
  }),
}));

vi.mock("@/services/studio-brand.service", () => ({
  replaceStudioLogo: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn(() => builder),
        limit: vi.fn(() => builder),
        order: vi.fn(() => builder),
        maybeSingle: vi.fn(() => Promise.resolve({ data: table === "studios" ? studio : null, error: null })),
        returns: vi.fn(() => Promise.resolve({ data: table === "working_hours" ? mocks.workingHours : [], error: null })),
        update: vi.fn((payload: unknown) => {
          mocks.updates.push({ table, payload });
          return { eq: vi.fn(() => Promise.resolve({ error: null })) };
        }),
      };

      return builder;
    }),
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>,
  );
}

function getMondayWorkingHourInputs(container: HTMLElement) {
  const timeInputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="time"]'));
  const [openTime, closeTime] = timeInputs.filter(
    (input) => !input.disabled,
  );

  if (!openTime || !closeTime) throw new Error("Monday working-hour inputs were not found.");

  return { openTime, closeTime };
}

describe("Settings", () => {
  beforeEach(() => {
    mocks.updates.length = 0;
    mocks.workingHours = makeWorkingHours();
  });

  it("preserves customized times and saves all seven days", async () => {
    const view = renderPage();

    await waitFor(() => {
      if (view.container.querySelectorAll('input[type="time"]').length !== 14) throw new Error("Working hours are not loaded.");
    });
    const { openTime, closeTime } = getMondayWorkingHourInputs(view.container);
    fireEvent.change(openTime, { target: { value: "10:30" } });
    fireEvent.change(closeTime, { target: { value: "20:30" } });

    expect(openTime).toHaveValue("10:30");
    expect(closeTime).toHaveValue("20:30");

    fireEvent.click(screen.getByRole("button", { name: /salvar configurações/i }));

    await waitFor(() => expect(mocks.updates.filter((call) => call.table === "working_hours")).toHaveLength(7));
    expect(mocks.updates).toContainEqual({
      table: "working_hours",
      payload: expect.objectContaining({ day_of_week: 1, open_time: "10:30", close_time: "20:30", is_open: true }),
    });
  });

  it("rejects opening equal to or after closing", async () => {
    mocks.workingHours[1] = { ...mocks.workingHours[1], open_time: "18:00", close_time: "18:00" };
    const view = renderPage();

    await waitFor(() => {
      if (view.container.querySelectorAll('input[type="time"]').length !== 14) throw new Error("Working hours are not loaded.");
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar configurações/i }));

    expect(screen.getByText(/abertura precisa ser antes do fechamento/i)).toBeInTheDocument();
    expect(mocks.updates.filter((call) => call.table === "working_hours")).toHaveLength(0);
  });
});
