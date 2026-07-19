import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboardAccess } from "@/hooks/useDashboardAccess";
import type { AppointmentStatus } from "@/lib/appointment-domain";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  getMonthRevenue,
  getNextAppointments,
  getSetupStatus,
  getTodayAppointments,
  getTotalClients,
  getWeekAppointments,
  updateAppointmentStatus,
  type DashboardAppointment,
  type DashboardSetupStatus,
  type DashboardStudio,
} from "@/services/dashboard.service";

type DashboardSummary = {
  todayAppointments: number;
  weekAppointments: number;
  monthRevenue: number;
  totalClients: number;
};

export function useDashboard() {
  const access = useDashboardAccess();
  const studio = useMemo<DashboardStudio | null>(
    () =>
      access
        ? {
            id: access.studioId,
            name: access.studioName,
            slug: access.studioSlug,
            logo_url: access.studioLogoUrl,
          }
        : null,
    [access],
  );
  const [summary, setSummary] = useState<DashboardSummary>({
    todayAppointments: 0,
    weekAppointments: 0,
    monthRevenue: 0,
    totalClients: 0,
  });
  const [nextAppointments, setNextAppointments] = useState<DashboardAppointment[]>([]);
  const [setupStatus, setSetupStatus] = useState<DashboardSetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!studio) return;

    try {
      setLoading(true);
      setError("");

      const [todayAppointments, weekAppointments, monthRevenue, totalClients, appointments, setup] =
        await Promise.all([
          getTodayAppointments(studio.id),
          getWeekAppointments(studio.id),
          getMonthRevenue(studio.id),
          getTotalClients(studio.id),
          getNextAppointments(studio.id, 5),
          getSetupStatus(studio.id),
        ]);

      setSummary({
        todayAppointments,
        weekAppointments,
        monthRevenue,
        totalClients,
      });
      setNextAppointments(appointments);
      setSetupStatus(setup);
    } catch (caughtError) {
      logger.error("Falha ao carregar dashboard", caughtError);
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível carregar o dashboard."));
    } finally {
      setLoading(false);
    }
  }, [studio]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function setAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
    await updateAppointmentStatus(appointmentId, status);
    await loadDashboard();
  }

  return {
    studio,
    summary,
    nextAppointments,
    setupStatus,
    loading,
    error,
    setAppointmentStatus,
  };
}
