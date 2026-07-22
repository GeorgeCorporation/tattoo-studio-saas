import type { OnboardingWorkingHour } from "@/services/onboarding.service";

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

export function intervalsOverlap(
  firstStart: number,
  firstDuration: number,
  secondStart: number,
  secondDuration: number,
): boolean {
  return firstStart < secondStart + secondDuration && secondStart < firstStart + firstDuration;
}

export const LEGACY_APPOINTMENT_DURATION_MINUTES = 60;

export function getAppointmentDuration(durationMinutes: number | null | undefined): number {
  return durationMinutes == null ? LEGACY_APPOINTMENT_DURATION_MINUTES : durationMinutes;
}

export function getDayOfWeekFromDateInput(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

export function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isPastDate(date: string, today = new Date()): boolean {
  return date < toLocalDateInputValue(today);
}

export type ScheduledInterval = {
  time: string;
  durationMinutes: number | null | undefined;
};

export function hasAppointmentConflict(
  startTime: string,
  durationMinutes: number | null | undefined,
  appointments: ScheduledInterval[],
): boolean {
  const start = timeToMinutes(startTime);
  const duration = getAppointmentDuration(durationMinutes);

  return appointments.some((appointment) =>
    intervalsOverlap(
      start,
      duration,
      timeToMinutes(appointment.time),
      getAppointmentDuration(appointment.durationMinutes),
    ),
  );
}

export function isWithinWorkingHours(
  startTime: string,
  durationMinutes: number,
  workingHour: OnboardingWorkingHour,
): boolean {
  if (!workingHour.is_open || !workingHour.open_time || !workingHour.close_time) return false;

  const start = timeToMinutes(startTime);
  const open = timeToMinutes(workingHour.open_time);
  const close = timeToMinutes(workingHour.close_time);

  return start >= open && start + durationMinutes <= close;
}
