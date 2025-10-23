import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    base: './',
    
    server: {
      host: '0.0.0.0',
      port: 3002,  // Changed to 3002 to avoid conflict
      open: true,
      strictPort: true,
    },
    
    preview: {
      port: 3002,  // Changed to 3002
      strictPort: true,
    },
    
    build: {
      outDir: 'dist',
      sourcemap: isProduction ? false : 'inline',
      minify: isProduction ? 'esbuild' : false,
      cssMinify: isProduction,
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              if (id.includes('@radix-ui')) {
                return 'vendor-radix';
              }
              if (id.includes('react')) {
                return 'vendor-react';
              }
              return 'vendor';
            }
            return undefined;
          },
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash][extname]',
        },
      },
      assetsInlineLimit: 4096,
      manifest: isProduction,
    },
    
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
      }),
    ],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '~': path.resolve(__dirname, './'),
      },
    },
    
    define: {
      'process.env': {},
      'import.meta.env.MODE': JSON.stringify(mode),
      global: 'globalThis',
    },
    
    optimizeDeps: {
      include: ['@emotion/react/jsx-dev-runtime'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
  };
});