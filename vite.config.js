import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Cancio Club roda hoje como site estático arrastado pro Netlify (sem servidor próprio) —
// por isso base relativo ("./") e nada que dependa de um domínio/caminho fixo.
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      // injectManifest: o sw.js continua escrito à mão (a regra "nunca cachear supabase.co" é
      // lógica de negócio, não algo que um gerador genérico deveria decidir) — o plugin só injeta
      // a lista de assets com hash do build no lugar do self.__WB_MANIFEST.
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      injectManifest: {
        injectionPoint: "self.__WB_MANIFEST",
      },
      manifest: false, // manifest.json já existe na raiz e é servido como estático
      injectRegister: false, // o próprio index.html registra o SW (ver main.jsx)
      devOptions: { enabled: false },
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
