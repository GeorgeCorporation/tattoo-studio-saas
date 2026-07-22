import { beforeEach, describe, expect, it, vi } from "vitest";

let workingHour: {
  id: string;
  studio_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_open: boolean;
} | null = null;
let bookedTimes: { booked_time: string }[] = [];
let appointmentInsertError: { code?: string; message: string } | null = null;
let appointmentInsertCount = 0;
let serviceDuration: number | null = 60;

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === "working_hours") {
        const builder = {
          select: vi.fn(() => builder),
          eq: vi.fn(() => builder),
          maybeSingle: vi.fn(() => Promise.resolve({ data: workingHour, error: null })),
        };
        return builder;
      }

      if (table === "appointments") {
        const builder = {
          insert: vi.fn(() => {
            appointmentInsertCount += 1;
            return builder;
          }),
          select: vi.fn(() => builder),
          single: vi.fn(() =>
            Promise.resolve({
              data: appointmentInsertError ? null : { id: "appointment-1" },
              error: appointmentInsertError,
            }),
          ),
        };
        return builder;
      }

      if (table === "tattoo_artists" || table === "services") {
        const builder = {
          select: vi.fn(() => builder),
          eq: vi.fn(() => builder),
          maybeSingle: vi.fn(() =>
            Promise.resolve({
              data:
                table === "tattoo_artists"
                  ? { id: "artist-1" }
                  : { id: "service-1", avg_duration_minutes: serviceDuration },
              error: null,
            }),
          ),
        };
        return builder;
      }

      return {};
    }),
    rpc: vi.fn(() => Promise.resolve({ data: bookedTimes, error: null })),
    storage: {
      from: vi.fn(),
    },
  },
}));

describe("booking flow", () => {
  beforeEach(() => {
    workingHour = {
      id: "hours-1",
      studio_id: "studio-1",
      day_of_week: 1,
      open_time: "09:00",
      close_time: "12:00",
      is_open: true,
    };
    bookedTimes = [];
    appointmentInsertError = null;
    appointmentInsertCount = 0;
    serviceDuration = 60;
  });

  it("remove horario ja ocupado da disponibilidade", async () => {
    bookedTimes = [{ booked_time: "10:00:00" }];
    const { getAvailableTimeSlots } = await import("@/services/booking.service");

    await expect(getAvailableTimeSlots("studio-1", "artist-1", "2099-07-01")).resolves.toEqual([
      "09:00",
      "11:00",
    ]);
  });

  it("nao mostra horarios em dia fechado", async () => {
    workingHour = { ...workingHour!, is_open: false };
    const { getAvailableTimeSlots } = await import("@/services/booking.service");

    await expect(getAvailableTimeSlots("studio-1", "artist-1", "2099-07-01")).resolves.toEqual([]);
  });

  it("bloqueia cliente online fora do expediente", async () => {
    const { BookingAvailabilityError, createAppointment } = await import("@/services/booking.service");

    await expect(
      createAppointment({
        studioId: "studio-1",
        artistId: "artist-1",
        clientId: "client-1",
        serviceId: "service-1",
        date: "2099-07-01",
        time: "12:00",
        description: "tattoo",
      }),
    ).rejects.toBeInstanceOf(BookingAvailabilityError);
    expect(appointmentInsertCount).toBe(0);
  });

  it("bloqueia conflito por sobreposicao", async () => {
    bookedTimes = [{ booked_time: "10:00:00" }];
    serviceDuration = 120;
    const { BookingAvailabilityError, createAppointment } = await import("@/services/booking.service");

    await expect(
      createAppointment({
        studioId: "studio-1",
        artistId: "artist-1",
        clientId: "client-1",
        serviceId: "service-1",
        date: "2099-07-01",
        time: "09:00",
        description: "tattoo",
      }),
    ).rejects.toBeInstanceOf(BookingAvailabilityError);
    expect(appointmentInsertCount).toBe(0);
  });

  it("duracao de 120 minutos ocupa duas horas", async () => {
    bookedTimes = [{ booked_time: "11:00:00" }];
    const { getAvailableTimeSlots } = await import("@/services/booking.service");

    await expect(getAvailableTimeSlots("studio-1", "artist-1", "2099-07-01", 120)).resolves.toEqual([
      "09:00",
    ]);
  });

  it("usa 60 minutos quando servico legado nao tem duracao", async () => {
    bookedTimes = [{ booked_time: "11:00:00" }];
    const { getAvailableTimeSlots } = await import("@/services/booking.service");

    await expect(getAvailableTimeSlots("studio-1", "artist-1", "2099-07-01", null)).resolves.toEqual([
      "09:00",
      "10:00",
    ]);
  });

  it("bloqueia data passada antes de salvar", async () => {
    const { BookingAvailabilityError, createAppointment } = await import("@/services/booking.service");

    await expect(
      createAppointment({
        studioId: "studio-1",
        artistId: "artist-1",
        clientId: "client-1",
        serviceId: "service-1",
        date: "2000-01-01",
        time: "09:00",
        description: "tattoo",
      }),
    ).rejects.toBeInstanceOf(BookingAvailabilityError);
    expect(appointmentInsertCount).toBe(0);
  });

  it("cria appointment quando horario esta disponivel", async () => {
    const { createAppointment } = await import("@/services/booking.service");

    await expect(
      createAppointment({
        studioId: "studio-1",
        artistId: "artist-1",
        clientId: "client-1",
        serviceId: "service-1",
        date: "2099-07-01",
        time: "09:00",
        description: "tattoo",
      }),
    ).resolves.toEqual({ id: "appointment-1" });
  });

  it("bloqueia appointment quando banco acusa horario duplicado", async () => {
    appointmentInsertError = { code: "23505", message: "duplicate key value violates unique constraint" };
    const { BookingAvailabilityError, createAppointment } = await import("@/services/booking.service");

    await expect(
      createAppointment({
        studioId: "studio-1",
        artistId: "artist-1",
        clientId: "client-1",
        serviceId: "service-1",
        date: "2099-07-01",
        time: "09:00",
        description: "tattoo",
      }),
    ).rejects.toBeInstanceOf(BookingAvailabilityError);
  });
});
