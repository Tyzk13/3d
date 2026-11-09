import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'node:path';

// `npm run build`        → dist/ (vários arquivos, ideal para hospedar com cache)
// `npm run build:single` → dist-single/index.html (tudo embutido num HTML só)
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    // HTML único usa a versão leve dos assets (texturas 512 px, árvores LOD1): tools/assets-leves.mjs
    resolve: { alias: { '@assets': path.resolve(__dirname, single ? 'src/assets-lite' : 'src/assets') } },
    build: single
      ? { outDir: 'dist-single', assetsInlineLimit: () => true, chunkSizeWarningLimit: 100000 }
      : { outDir: 'dist', chunkSizeWarningLimit: 4000 },
    plugins: single ? [viteSingleFile({ removeViteModuleLoader: true })] : [],
    server: { host: true },
  };
});
