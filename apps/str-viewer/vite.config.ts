import { defineConfig } from "vite";

declare const process: {
  env: {
    VITE_BASE_PATH?: string;
  };
};

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
