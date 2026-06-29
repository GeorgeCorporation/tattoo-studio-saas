import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getCurrentUserStudio,
  getMonthRevenue,
  getNextAppointments,
  getTodayAppointments,
  getTotalClients,
  getWeekAppointments,
  updateAppointmentStatus,
  type DashboardAppointment,
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

      const [todayAppointments, weekAppointments, monthRevenue, totalClients, appointments] =
        await Promise.all([
          getTodayAppointments(foundStudio.id),
          getWeekAppointments(foundStudio.id),
          getMonthRevenue(foundStudio.id),
          getTotalClients(foundStudio.id),
          getNextAppointments(foundStudio.id, 5),
        ]);

      setSummary({
        todayAppointments,
        weekAppointments,
        monthRevenue,
        totalClients,
      });
      setNextAppointments(appointments);
    } catch {
      setError("Nao foi possivel carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function setAppointmentStatus(appointmentId: string, status: string) {
    await updateAppointmentStatus(appointmentId, status);
    await loadDashboard();
  }

  return {
    studio,
    summary,
    nextAppointments,
    loading,
    error,
    setAppointmentStatus,
  };
}
