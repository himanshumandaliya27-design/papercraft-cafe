import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
        '@atelier/shared': path.resolve(import.meta.dirname, '../../packages/shared/src/index.ts'),
        '@shared': path.resolve(import.meta.dirname, '../../packages/shared/src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/firebase')) return 'vendor-firebase';
            if (id.includes('node_modules/motion')) return 'vendor-motion';
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'vendor-react';
          },
        },
      },
    },
    server: {
      port: 3002,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
