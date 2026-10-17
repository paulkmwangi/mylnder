import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://myinder-server.onrender.com",
        changeOrigin: true,
        secure: true,
        configure(proxy) {
          proxy.on("proxyRes", (response, request) => {
            if (request.url?.startsWith("/api/images/")) {
              delete response.headers["cross-origin-resource-policy"];
            }
          });
        },
      },
    },
  },
});