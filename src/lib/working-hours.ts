import type { OnboardingWorkingHour } from "@/services/onboarding.service";
import { timeToMinutes } from "@/lib/scheduling-domain";

export type WorkingHourField = "is_open" | "open_time" | "close_time";

export function updateWorkingHourField(
  hour: OnboardingWorkingHour,
  field: WorkingHourField,
  value: boolean | string | null,
): OnboardingWorkingHour {
  if (field === "is_open") {
    const isOpen = value === true;

    return {
      ...hour,
      is_open: isOpen,
      open_time: isOpen ? hour.open_time ?? "09:00" : null,
      close_time: isOpen ? hour.close_time ?? "18:00" : null,
    };
  }

  return {
    ...hour,
    [field]: typeof value === "string" || value === null ? value : hour[field],
  };
}

export function validateWorkingHours(hours: OnboardingWorkingHour[]): string {
  const invalidHour = hours.find(
    (hour) =>
      hour.is_open &&
      (!hour.open_time || !hour.close_time || timeToMinutes(hour.open_time) >= timeToMinutes(hour.close_time)),
  );

  return invalidHour ? "Confira os horários: abertura precisa ser antes do fechamento." : "";
}
