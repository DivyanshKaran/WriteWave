import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initClientObservability } from "@/lib/observability";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@/components/Analytics";

initClientObservability();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
