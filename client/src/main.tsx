import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@fontsource-variable/manrope";
import "@fontsource-variable/bricolage-grotesque";
import "./theme.css";

const rootEl = document.querySelector<HTMLElement>("[data-generated-space-root]")
  ?? document.getElementById("root");
if (!rootEl) {
  throw new Error("missing generated space root element");
}

// Versi bisa-diisi: QueryClient dibuat lokal (dulu spaceQueryClient dari SDK).
// Pembungkus hatch-space-root dipertahankan agar tidak mengubah layout,
// tapi tidak lagi bergantung pada CSS/JS SDK apa pun.
const queryClient = new QueryClient();

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="hatch-space-root" data-hatch-space-root>
        <App />
      </div>
    </QueryClientProvider>
  </StrictMode>,
);
