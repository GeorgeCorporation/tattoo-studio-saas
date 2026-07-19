import { useOutletContext } from "react-router-dom";
import type { PrivateRouteOutletContext } from "@/components/layout/PrivateRoute";

export function useDashboardAccess() {
  return useOutletContext<PrivateRouteOutletContext>().access;
}
