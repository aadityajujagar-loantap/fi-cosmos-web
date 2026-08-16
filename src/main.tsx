import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./auth/AuthProvider";
import { DataProvider } from "./data/DataProvider";

createRoot(document.getElementById("root")!).render(
  <AuthProvider><DataProvider><App /></DataProvider></AuthProvider>,
);
