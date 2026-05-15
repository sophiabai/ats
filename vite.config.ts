import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Group library code into a handful of stable shared chunks so navigations
// don't refetch overlapping vendor code. Order matters: more specific matches
// first.
function manualChunks(id: string): string | undefined {
  if (!id.includes("node_modules")) return;

  if (id.includes("/platejs/") || id.includes("@platejs/")) return "vendor-plate";
  if (id.includes("/@xyflow/")) return "vendor-xyflow";
  if (id.includes("/@radix-ui/") || id.includes("/radix-ui/")) return "vendor-radix";
  if (
    id.includes("/react-markdown/") ||
    id.includes("/marked/") ||
    id.includes("/remark") ||
    id.includes("/rehype") ||
    id.includes("/micromark") ||
    id.includes("/mdast") ||
    id.includes("/unist") ||
    id.includes("/hast")
  ) {
    return "vendor-markdown";
  }
  if (id.includes("/lucide-react/")) return "vendor-icons";
  if (id.includes("/date-fns/") || id.includes("/react-day-picker/")) return "vendor-date";
  if (id.includes("/@supabase/")) return "vendor-supabase";
  if (id.includes("/@tanstack/")) return "vendor-query";
  if (
    id.includes("/react/") ||
    id.includes("/react-dom/") ||
    id.includes("/react-router/") ||
    id.includes("/scheduler/")
  ) {
    return "vendor-react";
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  server: {
    hmr: false,
    watch: {
      usePolling: true,
      interval: 500,
    },
  },
});
