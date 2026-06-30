import { supabase } from "@/lib/supabase";

export type ReminderStatus = "pending" | "sent" | "failed" | "cancelled";

export type AppointmentReminder = {
  id: string;
  studio_id: string;
  appointment_id: string;
  channel: "whatsapp";
  scheduled_for: string;
  status: ReminderStatus;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
};

export type CreateReminderData = {
  studioId: string;
  appointmentId: string;
  scheduledFor: string;
};

export async function createAppointmentReminder(data: CreateReminderData) {
  const { data: reminder, error } = await supabase
    .from("appointment_reminders")
    .insert({
      studio_id: data.studioId,
      appointment_id: data.appointmentId,
      channel: "whatsapp",
      scheduled_for: data.scheduledFor,
      status: "pending",
    })
    .select("*")
    .single<AppointmentReminder>();

  if (error) throw error;
  return reminder;
}

export async function getPendingReminders(studioId: string) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("appointment_reminders")
    .select("*")
    .eq("studio_id", studioId)
    .eq("status", "pending")
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .returns<AppointmentReminder[]>();

  if (error) throw error;
  return data ?? [];
}

export async function markReminderSent(id: string) {
  const { error } = await supabase
    .from("appointment_reminders")
    .update({ status: "sent", sent_at: new Date().toISOString(), error_message: null })
    .eq("id", id);

  if (error) throw error;
}

export async function markReminderFailed(id: string, errorMessage: string) {
  const { error } = await supabase
    .from("appointment_reminders")
    .update({ status: "failed", error_message: errorMessage })
    .eq("id", id);

  if (error) throw error;
}
