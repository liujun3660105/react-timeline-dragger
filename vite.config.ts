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
      // 明确指定外部依赖
      external: [
        /^react$/,
        /^react-dom$/,
        /^react-dom\/client$/,
        /^react\/jsx-runtime$/,
        /^react\/jsxs-runtime$/,
      ],
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
    // 减小打包体积
    minify: false,
    sourcemap: true,
  } : {},
}));
