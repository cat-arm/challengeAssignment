import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 80, // Frontend on port 80 (requires sudo on macOS/Linux)
    host: true, // Allow external connections
    proxy: {
      // Proxy /api/shorten endpoint to backend
      "/api/shorten": {
        target: "http://localhost:3001", // Backend on port 3001
        changeOrigin: true,
      },
      // Proxy /api/:key endpoint to backend
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
