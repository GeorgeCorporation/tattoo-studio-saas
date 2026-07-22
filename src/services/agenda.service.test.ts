import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  appointmentRows: [] as Array<{
    time: string;
    services: { avg_duration_minutes: number | null } | null;
  }>,
  inserts: [] as unknown[],
  workingHours: [] as Array<{
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_open: boolean;
  }>,
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn(() => builder),
        in: vi.fn(() => builder),
        order: vi.fn(() => builder),
        returns: vi.fn(() =>
          Promise.resolve({
            data: table === "working_hours" ? mocks.workingHours : mocks.appointmentRows,
            error: null,
          }),
        ),
        insert: vi.fn((payload: unknown) => {
          mocks.inserts.push(payload);
          return Promise.resolve({ error: null });
        }),
      };

      return builder;
    }),
  },
}));

import {
  AgendaAvailabilityError,
  AgendaWorkingHoursOverrideRequiredError,
  createAppointment,
  getAgendaWorkingHours,
  type CreateAgendaAppointmentData,
} from "@/services/agenda.service";

const openMonday = {
  day_of_week: 1,
  open_time: "09:00",
  close_time: "18:00",
  is_open: true,
};

function appointmentInput(overrides: Partial<CreateAgendaAppointmentData> = {}): CreateAgendaAppointmentData {
  return {
    studioId: "studio-1",
    clientId: "client-1",
    artistId: "artist-1",
    serviceId: "service-1",
    date: "2099-07-06",
    time: "09:00",
    description: "Fine line",
    clientSource: "artist_client",
    role: "artist",
    durationMinutes: 60,
    workingHours: [openMonday],
    ...overrides,
  };
}

describe("agenda.service", () => {
  beforeEach(() => {
    mocks.appointmentRows = [];
    mocks.inserts.length = 0;
    mocks.workingHours = Array.from({ length: 7 }, (_, day) => ({
      day_of_week: day,
      open_time: day === 1 ? "09:00" : null,
      close_time: day === 1 ? "18:00" : null,
      is_open: day === 1,
    }));
  });

  it("carrega as sete linhas de expediente do estudio", async () => {
    await expect(getAgendaWorkingHours("studio-1")).resolves.toHaveLength(7);
  });

  it("bloqueia tatuador fora do expediente", async () => {
    await expect(createAppointment(appointmentInput({ time: "18:00" }))).rejects.toBeInstanceOf(
      AgendaAvailabilityError,
    );
    expect(mocks.inserts).toHaveLength(0);
  });

  it("pede confirmacao ao gestor fora do expediente", async () => {
    await expect(
      createAppointment(appointmentInput({ role: "manager", time: "18:00" })),
    ).rejects.toBeInstanceOf(AgendaWorkingHoursOverrideRequiredError);
    expect(mocks.inserts).toHaveLength(0);
  });

  it("permite gestor fora do expediente apos override explicito", async () => {
    await createAppointment(
      appointmentInput({ role: "manager", time: "18:00", allowOutsideWorkingHours: true }),
    );

    expect(mocks.inserts).toHaveLength(1);
  });

  it("bloqueia conflito para gestor mesmo com override de expediente", async () => {
    mocks.appointmentRows = [{ time: "10:00", services: { avg_duration_minutes: 60 } }];

    await expect(
      createAppointment(
        appointmentInput({
          role: "manager",
          time: "09:00",
          durationMinutes: 120,
          allowOutsideWorkingHours: true,
        }),
      ),
    ).rejects.toBeInstanceOf(AgendaAvailabilityError);
    expect(mocks.inserts).toHaveLength(0);
  });

  it("considera a duracao real do agendamento existente", async () => {
    mocks.appointmentRows = [{ time: "09:00", services: { avg_duration_minutes: 120 } }];

    await expect(createAppointment(appointmentInput({ time: "10:00" }))).rejects.toBeInstanceOf(
      AgendaAvailabilityError,
    );
  });

  it("usa 60 minutos para agendamento legado sem duracao", async () => {
    mocks.appointmentRows = [{ time: "09:00", services: { avg_duration_minutes: null } }];

    await expect(createAppointment(appointmentInput({ time: "09:30" }))).rejects.toBeInstanceOf(
      AgendaAvailabilityError,
    );
  });

  it("bloqueia data passada para todos os papeis", async () => {
    await expect(
      createAppointment(
        appointmentInput({
          role: "manager",
          date: "2000-01-03",
          allowOutsideWorkingHours: true,
        }),
      ),
    ).rejects.toBeInstanceOf(AgendaAvailabilityError);
    expect(mocks.inserts).toHaveLength(0);
  });
});
