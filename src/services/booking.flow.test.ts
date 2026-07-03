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
          insert: vi.fn(() => builder),
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
              data: { id: table === "tattoo_artists" ? "artist-1" : "service-1" },
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
