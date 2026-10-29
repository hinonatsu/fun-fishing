import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FishingHero from "../FishingHero";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main>
      <FishingHero />
    </main>
  </StrictMode>,
);
