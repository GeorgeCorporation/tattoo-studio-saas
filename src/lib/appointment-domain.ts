export const appointmentStatuses = ["pending", "confirmed", "cancelled", "completed"] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

export const paymentTypes = ["signal", "final", "extra"] as const;
export type PaymentType = (typeof paymentTypes)[number];

export const paymentMethods = ["pix", "cash", "card"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Finalizado",
};

export const appointmentStatusClasses: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-300",
  confirmed: "bg-green-500/15 text-green-300",
  cancelled: "bg-red-500/15 text-red-300",
  completed: "bg-zinc-500/15 text-zinc-300",
};

export const paymentTypeLabels: Record<PaymentType, string> = {
  signal: "Sinal",
  final: "Final",
  extra: "Extra",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  card: "Cartão",
};

export const appointmentStatusTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [],
  completed: [],
};

export function isAppointmentStatus(value: string): value is AppointmentStatus {
  return appointmentStatuses.includes(value as AppointmentStatus);
}

export function canTransitionAppointmentStatus(current: AppointmentStatus, next: AppointmentStatus) {
  if (current === next) return true;
  return appointmentStatusTransitions[current].includes(next);
}

export function assertAppointmentStatus(value: string): asserts value is AppointmentStatus {
  if (!isAppointmentStatus(value)) {
    throw new Error(`Status de agendamento inválido: ${value}`);
  }
}

export function getAppointmentStatusLabel(status: string) {
  return isAppointmentStatus(status) ? appointmentStatusLabels[status] : status;
}

export function getAppointmentStatusClass(status: string) {
  return isAppointmentStatus(status)
    ? appointmentStatusClasses[status]
    : "bg-zinc-500/15 text-zinc-300";
}

export function buildWhatsAppReminderMessage(data: {
  studioName: string;
  clientName: string;
  artistName: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  return [
    `Olá, ${data.clientName}!`,
    `Passando para lembrar seu agendamento no ${data.studioName}:`,
    `*Tatuador:* ${data.artistName}`,
    `*Serviço:* ${data.serviceName}`,
    `*Data:* ${data.date}`,
    `*Horário:* ${data.time}`,
    "Se precisar remarcar, responda esta mensagem.",
  ].join("\n");
}

export function summarizeAppointmentStatuses(items: Array<{ status: string }>) {
  return items.reduce(
    (summary, item) => {
      if (isAppointmentStatus(item.status)) {
        summary[item.status] += 1;
      }

      return summary;
    },
    {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    } satisfies Record<AppointmentStatus, number>,
  );
}
