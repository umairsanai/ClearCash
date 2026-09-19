import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../css/index.css";
import "../css/auth.css";
import "../css/styles.css";
import App from "./App";
import { UserProvider } from "./context";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>
);
