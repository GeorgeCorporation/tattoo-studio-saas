import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { useDashboard } from "@/hooks/useDashboard";

vi.mock("@/hooks/useDashboard", () => ({
  useDashboard: vi.fn(),
}));

const mockUseDashboard = vi.mocked(useDashboard);

describe("Dashboard", () => {
  beforeEach(() => {
    mockUseDashboard.mockReset();
  });

  it("mostra progresso pendente dos primeiros passos", () => {
    mockUseDashboard.mockReturnValue({
      studio: { id: "studio-1", name: "Ideal Tattoo", slug: "ideal-tattoo", logo_url: null },
      summary: {
        todayAppointments: 0,
        weekAppointments: 0,
        monthRevenue: 0,
        totalClients: 0,
      },
      nextAppointments: [],
      setupStatus: {
        hasLogo: false,
        artistsCount: 0,
        servicesCount: 0,
        galleryCount: 0,
        appointmentsCount: 0,
      },
      loading: false,
      error: "",
      setAppointmentStatus: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText("1 de 6 concluídos para deixar seu estúdio pronto para divulgar e vender.")).toBeInTheDocument();
    expect(screen.getByText("Cadastrar primeiro tatuador")).toBeInTheDocument();
    expect(screen.getByText("Nenhum agendamento próximo encontrado.")).toBeInTheDocument();
  });

  it("mostra checklist concluido quando setup esta completo", () => {
    mockUseDashboard.mockReturnValue({
      studio: { id: "studio-1", name: "Ideal Tattoo", slug: "ideal-tattoo", logo_url: "logo.png" },
      summary: {
        todayAppointments: 2,
        weekAppointments: 5,
        monthRevenue: 500,
        totalClients: 12,
      },
      nextAppointments: [
        {
          id: "appointment-1",
          date: "2026-07-01",
          time: "14:00:00",
          status: "confirmed",
          clients: { name: "George" },
          tattoo_artists: { name: "Ana" },
          services: { name: "Fine Line" },
        },
      ],
      setupStatus: {
        hasLogo: true,
        artistsCount: 1,
        servicesCount: 1,
        galleryCount: 1,
        appointmentsCount: 1,
      },
      loading: false,
      error: "",
      setAppointmentStatus: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText("6 de 6 concluídos para deixar seu estúdio pronto para divulgar e vender.")).toBeInTheDocument();
    expect(screen.getByText("George")).toBeInTheDocument();
    expect(screen.getByText("Confirmado")).toBeInTheDocument();
  });
});
