import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    test: {
      types: ["vitest/globals"],
      globals: true, // This is the magic line!
      environment: "jsdom",
    },
    server: {
      port: parseInt(env.VITE_PORT) || 5000,
    },
  };
});
