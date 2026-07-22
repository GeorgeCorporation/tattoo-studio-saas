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
