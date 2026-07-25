import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AgendaAppointment } from "@/services/agenda.service";

const mocks = vi.hoisted(() => ({
  getAppointmentsByDate: vi.fn(),
  updateAppointmentStatus: vi.fn(),
}));

vi.mock("@/hooks/useDashboardAccess", () => ({
  useDashboardAccess: () => ({ studioId: "studio-1", role: "manager" }),
}));

vi.mock("@/services/agenda.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/agenda.service")>();
  return {
    ...actual,
    getAppointmentsByDate: mocks.getAppointmentsByDate,
    updateAppointmentStatus: mocks.updateAppointmentStatus,
  };
});

import { AgendaPage } from "@/pages/agenda/AgendaPage";

function appointment(id: string, date: string, clientName: string): AgendaAppointment {
  return {
    id,
    date,
    time: "09:00",
    status: "pending",
    description: null,
    notes: null,
    clients: { id: `client-${id}`, name: clientName, phone: null },
    tattoo_artists: { id: "artist-1", name: "Artista" },
    services: { id: "service-1", name: "Fine line" },
  };
}

describe("AgendaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ignora resposta atrasada da data anterior", async () => {
    const resolvers = new Map<string, (rows: AgendaAppointment[]) => void>();
    mocks.getAppointmentsByDate.mockImplementation(
      (_studioId: string, date: string) =>
        new Promise<AgendaAppointment[]>((resolve) => {
          resolvers.set(date, resolve);
        }),
    );
    render(<AgendaPage />);
    const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/);

    fireEvent.change(dateInput, { target: { value: "2099-07-06" } });
    await waitFor(() => expect(resolvers.has("2099-07-06")).toBe(true));
    fireEvent.change(dateInput, { target: { value: "2099-07-07" } });
    await waitFor(() => expect(resolvers.has("2099-07-07")).toBe(true));

    await act(async () => {
      resolvers.get("2099-07-07")?.([appointment("new", "2099-07-07", "Cliente atual")]);
    });
    expect(await screen.findByText("Cliente atual")).toBeInTheDocument();

    await act(async () => {
      resolvers.get("2099-07-06")?.([appointment("old", "2099-07-06", "Cliente antigo")]);
    });

    await waitFor(() => expect(screen.queryByText("Cliente antigo")).not.toBeInTheDocument());
    expect(screen.getByText("Cliente atual")).toBeInTheDocument();
  });

  it("nao recarrega a data antiga quando update de status termina apos troca de data", async () => {
    let resolveStatus!: () => void;
    mocks.updateAppointmentStatus.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveStatus = resolve;
        }),
    );
    mocks.getAppointmentsByDate.mockImplementation((_studioId: string, date: string) => {
      if (date === "2099-07-06") {
        return Promise.resolve([appointment("old", date, "Cliente da data A")]);
      }
      if (date === "2099-07-07") {
        return Promise.resolve([appointment("new", date, "Cliente da data B")]);
      }
      return Promise.resolve([]);
    });
    render(<AgendaPage />);
    const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/);

    fireEvent.change(dateInput, { target: { value: "2099-07-06" } });
    expect(await screen.findByText("Cliente da data A")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(mocks.updateAppointmentStatus).toHaveBeenCalledTimes(1));

    fireEvent.change(dateInput, { target: { value: "2099-07-07" } });
    expect(await screen.findByText("Cliente da data B")).toBeInTheDocument();

    await act(async () => resolveStatus());

    await waitFor(() => {
      const dateACalls = mocks.getAppointmentsByDate.mock.calls.filter(
        ([, date]) => date === "2099-07-06",
      );
      expect(dateACalls).toHaveLength(1);
    });
    expect(screen.getByText("Cliente da data B")).toBeInTheDocument();
  });
});
