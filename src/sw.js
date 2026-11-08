// Cancio Club — Service Worker (Sprint 7: PWA / Offline-First)
//
// O que este arquivo faz:
// - Guarda em cache o "esqueleto" do app (os assets com hash gerados pelo build do Vite,
//   injetados abaixo em PRECACHE_MANIFEST) assim que instala.
// - Estratégia: Stale-While-Revalidate — responde na hora com o que já está em
//   cache (rápido, funciona no avião/4G ruim) e, em paralelo, busca na rede pra
//   atualizar o cache pra próxima vez. Nunca fica travado numa versão antiga
//   pra sempre, porque toda visita já dispara uma atualização em segundo plano.
//
// O que este arquivo NUNCA faz:
// - Cachear chamadas de dados do Supabase (a variável real do aluno/professor).
//   Isso teria que ficar sempre fresco da rede — cachear resultaria em ver
//   dados desatualizados até muito tempo depois de a internet voltar.

const CACHE_NAME = "cancio-club-v36";

// self.__WB_MANIFEST é substituído em build time (vite-plugin-pwa, strategy "injectManifest")
// pela lista real de assets com hash ([{url, revision}, ...]) — por isso o pré-cache não precisa
// mais de uma lista fixa de arquivo por arquivo, só os dois pontos de entrada que não têm hash.
const PRECACHE_MANIFEST = self.__WB_MANIFEST;
const PRECACHE_URLS = ["./", "./manifest.json", ...PRECACHE_MANIFEST.map((e) => e.url)];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((e) => console.error("Cancio SW: falha ao pré-cachear:", e))
  );
  self.skipWaiting(); // ativa a nova versão do SW assim que possível, sem esperar todas as abas fecharem
});

self.addEventListener("activate", (event) => {
  // limpa caches de versões antigas do próprio app (não mexe em nada do Supabase)
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = req.url;

  // só mexe em GET — nunca intercepta POST/PATCH (é assim que o Supabase grava dados)
  if (req.method !== "GET") return;

  // NUNCA cachear chamadas de dados do Supabase — precisam ser sempre a versão mais nova da rede.
  // Isso é o que garante que o professor e o aluno sempre vejam o dado real, não uma foto antiga.
  if (url.indexOf("supabase.co") !== -1) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);

      // dispara a busca de rede em paralelo (atualiza o cache pra próxima visita),
      // mas não trava a resposta esperando ela se já tivermos algo em cache
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);

      if (cached) {
        // responde na hora com o cache; a rede atualiza silenciosamente em segundo plano
        networkFetch;
        return cached;
      }

      // sem cache ainda — espera a rede desta vez (primeira visita, por exemplo)
      const fromNetwork = await networkFetch;
      return fromNetwork || new Response("Offline e sem versão em cache para este recurso.", { status: 503, statusText: "Offline" });
    })
  );
});

// avisos: toque na notificação abre/foca o app; "push" já fica pronto pro servidor (Web Push/VAPID)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const open = list.find((c) => "focus" in c);
    return open ? open.focus() : self.clients.openWindow("./");
  }));
});
self.addEventListener("push", (event) => {
  let d = {}; try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data && event.data.text() }; }
  event.waitUntil(self.registration.showNotification(d.title || "Cancio Club", { body: d.body || "Você tem um recado novo.", icon: "icon-192.png", badge: "favicon-32.png", tag: "cancio-recado", renotify: true }));
});
