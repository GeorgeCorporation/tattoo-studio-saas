import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAppointment: vi.fn(),
  getAgendaArtists: vi.fn(),
  getAgendaClients: vi.fn(),
  getAgendaServices: vi.fn(),
  getAgendaWorkingHours: vi.fn(),
}));

vi.mock("@/services/agenda.service", () => {
  class AgendaAvailabilityError extends Error {}
  class AgendaWorkingHoursOverrideRequiredError extends Error {}

  return {
    ...mocks,
    AgendaAvailabilityError,
    AgendaWorkingHoursOverrideRequiredError,
  };
});

import { NewAppointmentModal } from "@/pages/agenda/NewAppointmentModal";
import {
  AgendaAvailabilityError,
  AgendaWorkingHoursOverrideRequiredError,
} from "@/services/agenda.service";

const workingHours = [
  { day_of_week: 1, open_time: "09:00", close_time: "18:00", is_open: true },
];

function renderModal(role: "manager" | "artist" = "manager") {
  return render(
    <NewAppointmentModal
      defaultDate="2099-07-06"
      onClose={vi.fn()}
      onCreated={vi.fn()}
      open
      role={role}
      studioId="studio-1"
    />,
  );
}

async function submitForm() {
  await screen.findByRole("option", { name: "Cliente" });
  fireEvent.change(screen.getByLabelText(/descri/i), { target: { value: "Fine line" } });
  fireEvent.click(screen.getByRole("button", { name: /criar agendamento/i }));
}

describe("NewAppointmentModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAgendaClients.mockResolvedValue([{ id: "client-1", name: "Cliente" }]);
    mocks.getAgendaArtists.mockResolvedValue([{ id: "artist-1", name: "Artista" }]);
    mocks.getAgendaServices.mockResolvedValue([
      {
        id: "service-1",
        name: "Fine line",
        starting_price: 200,
        avg_duration_minutes: 120,
      },
    ]);
    mocks.getAgendaWorkingHours.mockResolvedValue(workingHours);
    mocks.createAppointment.mockResolvedValue(undefined);
  });

  it("gestor cancela confirmacao fora do expediente e nada e salvo", async () => {
    mocks.createAppointment.mockRejectedValueOnce(
      new AgendaWorkingHoursOverrideRequiredError(),
    );
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderModal("manager");

    await submitForm();

    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    expect(mocks.createAppointment).toHaveBeenCalledTimes(1);
  });

  it("gestor confirma aviso e salvamento prossegue", async () => {
    mocks.createAppointment
      .mockRejectedValueOnce(
        new AgendaWorkingHoursOverrideRequiredError(),
      )
      .mockResolvedValueOnce(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onCreated = vi.fn();
    const onClose = vi.fn();
    render(
      <NewAppointmentModal
        defaultDate="2099-07-06"
        onClose={onClose}
        onCreated={onCreated}
        open
        role="manager"
        studioId="studio-1"
      />,
    );

    await submitForm();

    await waitFor(() => expect(mocks.createAppointment).toHaveBeenCalledTimes(2));
    expect(mocks.createAppointment).toHaveBeenLastCalledWith(
      expect.objectContaining({ allowOutsideWorkingHours: true, role: "manager", durationMinutes: 120 }),
    );
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("tatuador recebe bloqueio sem confirmacao", async () => {
    mocks.createAppointment.mockRejectedValueOnce(
      new AgendaAvailabilityError("Esse horário está fora do expediente do estúdio."),
    );
    const confirm = vi.spyOn(window, "confirm");
    renderModal("artist");

    await submitForm();

    expect(await screen.findByText(/fora do expediente do estúdio/i)).toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
    expect(mocks.createAppointment).toHaveBeenCalledTimes(1);
  });

  it.each([
    [/carregar clientes/i, "getAgendaClients"],
    [/carregar tatuadores/i, "getAgendaArtists"],
    [/carregar servi/i, "getAgendaServices"],
    [/carregar hor/i, "getAgendaWorkingHours"],
  ] as const)("exibe erro especifico ao falhar carregamento de %s", async (message, method) => {
    mocks[method].mockRejectedValueOnce(new Error("network"));
    renderModal();

    expect(await screen.findByText(message)).toBeInTheDocument();
  });
});
