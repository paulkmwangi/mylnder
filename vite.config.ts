import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const adminApiOrigin = env.VITE_ADMIN_API_ORIGIN;
  if (!adminApiOrigin) {
    throw new Error("VITE_ADMIN_API_ORIGIN must be set in the environment.");
  }

  return {
    plugins: [react()],
    images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.neon.tech",
    },
  ],
},
    server: {
      proxy: {
        "/api": {
          target: adminApiOrigin,
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
  };
});