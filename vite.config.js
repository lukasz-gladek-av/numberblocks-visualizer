import { defineConfig } from 'vite';

export default defineConfig({
  base: '/numberblocks-visualizer/',
  build: {
    outDir: 'docs',
    emptyOutDir: true
  }
});
