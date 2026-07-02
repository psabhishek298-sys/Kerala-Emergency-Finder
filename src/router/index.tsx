import { createBrowserRouter } from "react-router-dom";
import { App } from "@/App";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorState } from "@/components/shared/error-state";
import { HomePage } from "@/pages/home-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorState title="Something went wrong" />,
    children: [
      {
        index: true,
        element: (
          <AppShell>
            <HomePage />
          </AppShell>
        ),
      },
    ],
  },
]);
