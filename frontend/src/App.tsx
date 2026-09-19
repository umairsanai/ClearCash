import { useEffect, useState } from "react";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { getCurrentRoute, type Route } from "./router";

export default function App() {
  const [route, setRoute] = useState<Route>(getCurrentRoute);

  useEffect(() => {
    function updateRoute() {
      setRoute(getCurrentRoute());
    }

    window.addEventListener("popstate", updateRoute);
    return () => window.removeEventListener("popstate", updateRoute);
  }, []);

  useEffect(() => {
    const isAuthPage = route === "/auth";
    document.body.className = isAuthPage ? "auth-page" : "dashboard-page";
    document.title = isAuthPage
      ? "ClearCash - Login"
      : "ClearCash - Digital Wallet";

    return () => {
      document.body.className = "";
    };
  }, [route]);

  return route === "/auth" ? <AuthPage /> : <DashboardPage />;
}
