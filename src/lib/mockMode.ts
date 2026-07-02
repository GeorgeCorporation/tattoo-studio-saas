import type { User } from "@supabase/supabase-js";
import type { DashboardSetupStatus, DashboardStudio } from "@/services/dashboard.service";
import type { UserStudio } from "@/services/onboarding.service";

const mockModeKey = "ideal-tattoo:mock-mode";
const studioKey = "ideal-tattoo:mock-studio";

function readMockMode() {
  if (import.meta.env.VITE_USE_MOCK === "true") return true;
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  const mockParam = params.get("mock");

  if (mockParam === "1" || mockParam === "true") {
    window.localStorage.setItem(mockModeKey, "true");
    return true;
  }

  if (mockParam === "0" || mockParam === "false") {
    window.localStorage.removeItem(mockModeKey);
    window.localStorage.removeItem(studioKey);
    return false;
  }

  return window.localStorage.getItem(mockModeKey) === "true";
}

export const isMockMode = readMockMode();

export const mockUser = {
  id: "mock-user-1",
  app_metadata: {},
  aud: "authenticated",
  created_at: "2026-07-01T00:00:00.000Z",
  email: "teste@idealtattoo.com",
  user_metadata: {
    full_name: "Usuário Teste",
  },
} as User;

export function getMockStudio(): UserStudio | null {
  const saved = window.localStorage.getItem(studioKey);
  if (!saved) return null;
  return JSON.parse(saved) as UserStudio;
}

export function saveMockStudio(studio: UserStudio) {
  window.localStorage.setItem(studioKey, JSON.stringify(studio));
}

export function clearMockStudio() {
  window.localStorage.removeItem(studioKey);
}

export function getMockDashboardStudio(): DashboardStudio | null {
  const studio = getMockStudio();
  if (!studio) return null;

  return {
    ...studio,
    logo_url: null,
  };
}

export function getMockSetupStatus(): DashboardSetupStatus {
  return {
    hasLogo: false,
    artistsCount: 1,
    servicesCount: 1,
    galleryCount: 0,
    appointmentsCount: 0,
  };
}
