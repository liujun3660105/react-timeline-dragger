import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: mode === 'lib' ? {
    lib: {
      entry: path.resolve(__dirname, 'src/components/Timeline/index.ts'),
      name: 'ReactTimelineSlider',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: 'index[extname]',
      },
    },
    cssCodeSplit: false,
    copyPublicDir: false,
  } : {},
}));
