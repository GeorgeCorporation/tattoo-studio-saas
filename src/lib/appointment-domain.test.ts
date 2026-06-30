import { describe, expect, it } from "vitest";
import {
  buildWhatsAppReminderMessage,
  canTransitionAppointmentStatus,
  getAppointmentStatusLabel,
  summarizeAppointmentStatuses,
} from "@/lib/appointment-domain";

describe("appointment-domain", () => {
  it("permite transicoes validas de status", () => {
    expect(canTransitionAppointmentStatus("pending", "confirmed")).toBe(true);
    expect(canTransitionAppointmentStatus("confirmed", "completed")).toBe(true);
    expect(canTransitionAppointmentStatus("completed", "pending")).toBe(false);
  });

  it("retorna label seguro para status conhecido ou desconhecido", () => {
    expect(getAppointmentStatusLabel("confirmed")).toBe("Confirmado");
    expect(getAppointmentStatusLabel("custom")).toBe("custom");
  });

  it("monta mensagem base de lembrete por WhatsApp", () => {
    expect(
      buildWhatsAppReminderMessage({
        studioName: "Ideal Tattoo",
        clientName: "George",
        artistName: "Ana",
        serviceName: "Fine Line",
        date: "2026-07-01",
        time: "14:00",
      }),
    ).toContain("*Tatuador:* Ana");
  });

  it("resume status dos agendamentos", () => {
    expect(
      summarizeAppointmentStatuses([
        { status: "pending" },
        { status: "confirmed" },
        { status: "confirmed" },
        { status: "unknown" },
      ]),
    ).toEqual({
      pending: 1,
      confirmed: 2,
      cancelled: 0,
      completed: 0,
    });
  });
});
