import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { AppointmentStatus } from "@/lib/appointment-domain";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  getCurrentUserStudio,
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
  const { user } = useAuth();
  const [studio, setStudio] = useState<DashboardStudio | null>(null);
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
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const foundStudio = await getCurrentUserStudio(user.id);
      setStudio(foundStudio);

      if (!foundStudio) return;

      const [todayAppointments, weekAppointments, monthRevenue, totalClients, appointments, setup] =
        await Promise.all([
          getTodayAppointments(foundStudio.id),
          getWeekAppointments(foundStudio.id),
          getMonthRevenue(foundStudio.id),
          getTotalClients(foundStudio.id),
          getNextAppointments(foundStudio.id, 5),
          getSetupStatus(foundStudio.id),
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
  }, [user]);

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
