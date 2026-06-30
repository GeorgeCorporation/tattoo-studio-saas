import React from "react";
import ReactDOM from "react-dom/client";
import { AppErrorBoundary } from "@/components/shared/AppErrorBoundary";
import { AppRoutes } from "@/routes";
import "@/styles/global.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AppRoutes />
    </AppErrorBoundary>
  </React.StrictMode>,
);
