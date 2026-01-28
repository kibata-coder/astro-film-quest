import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // START OF OPTIMIZED BUILD CONFIG
  build: {
    target: "es2015", // Critical for HY300 Projector
    outDir: "dist",
    minify: "terser", // Better minification than esbuild
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    cssMinify: true,
    cssCodeSplit: true, // Split CSS for better caching
    sourcemap: false, // Disable sourcemaps in production for smaller size
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI components
          'ui-components': [
            'lucide-react',
            '@radix-ui/react-dialog',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-scroll-area',
          ],
          // Data fetching
          'data-vendor': ['@tanstack/react-query', 'axios', '@supabase/supabase-js'],
          // Form libraries
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Utilities
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority', 'date-fns'],
        },
        // Optimize chunk names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  // END OF OPTIMIZED BUILD CONFIG
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
