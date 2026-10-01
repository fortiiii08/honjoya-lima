import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getRouter } from "./router";
import { Route as rootRoute } from "./routes/__root";
import "./styles.css";

// No build SPA o React monta dentro de <div id="root">, e o index.html já tem <html>/<head>/<body>.
// O shell do __root (que renderiza <html>/<body> para o SSR) quebra a página aqui: ao digitar
// em qualquer campo o React entra em loop e a aba trava. Por isso o shell é removido aqui.
delete (rootRoute.options as { shellComponent?: unknown }).shellComponent;

const router = getRouter();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
