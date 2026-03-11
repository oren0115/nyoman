import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  define: {
    "import.meta.env.VITE_PUBLIC_API_URL": JSON.stringify(
      (process.env.VITE_PUBLIC_API_URL?.trim() || "http://localhost:4000").replace(/\/$/, "")
    ),
  },
});
