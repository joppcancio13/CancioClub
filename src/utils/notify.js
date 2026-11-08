// avisos do app: número no ícone (badge) + notificação do sistema quando o app está em segundo plano.
// O service worker já trata "push" — falta só o servidor mandar (ver HANDOFF: Web Push).
const canNotify = () => typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
function setBadge(n) { try { if (n > 0) navigator.setAppBadge && navigator.setAppBadge(n); else navigator.clearAppBadge && navigator.clearAppBadge(); } catch (e) { } }
async function askNotify() { if (!canNotify()) return "unsupported"; try { return await Notification.requestPermission(); } catch (e) { return "denied"; } }
async function notify(title, body) {
    if (!canNotify() || Notification.permission !== "granted" || document.visibilityState === "visible") return;
    try { const reg = await navigator.serviceWorker.ready; reg.showNotification(title, { body, icon: "icon-192.png", badge: "favicon-32.png", tag: "cancio-recado", renotify: true }); } catch (e) { }
}
export { canNotify, setBadge, askNotify, notify };
