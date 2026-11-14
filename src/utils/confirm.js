// Confirmação e aviso no visual do app, no lugar de window.confirm/alert (caixas cinzas do navegador).
// Vanilla DOM: funciona de qualquer callback, sem estado React. Devolve Promise<boolean>.
function sheet({ title, message, ok = "Confirmar", cancel = "Cancelar", danger = false, alertOnly = false }) {
    return new Promise((resolve) => {
        const prevFocus = document.activeElement;
        const wrap = document.createElement("div");
        wrap.setAttribute("role", "alertdialog");
        wrap.setAttribute("aria-modal", "true");
        wrap.style.cssText = "position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;background:rgba(5,6,10,.72);font-family:Archivo,system-ui,sans-serif";
        const box = document.createElement("div");
        box.style.cssText = "width:100%;max-width:480px;box-sizing:border-box;margin:0 12px calc(env(safe-area-inset-bottom) + 12px);padding:22px 20px 16px;border-radius:24px;background:#0E1015;box-shadow:inset 0 0 0 1px #2E333D;color:#F2F5FA;display:flex;flex-direction:column;gap:10px";
        const h = document.createElement("div");
        h.style.cssText = "font-weight:800;font-size:18px;line-height:1.25";
        h.textContent = title || (alertOnly ? "Atenção" : "Tem certeza?");
        const p = document.createElement("div");
        p.style.cssText = "font-size:15px;line-height:1.5;color:#AEB7C6";
        p.textContent = message || "";
        const row = document.createElement("div");
        row.style.cssText = "display:flex;gap:8px;margin-top:8px";
        const mk = (label, primary) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.className = "cc-tap"; b.style.cssText = "flex:1;min-height:52px;border-radius:16px;border:none;cursor:pointer;font-family:inherit;font-size:15px;" + (primary ? (danger ? "background:#E8794B;color:#05060A;font-weight:800" : "background:#F2F5FA;color:#05060A;font-weight:800") : "background:transparent;color:#C6D2E4;font-weight:600;box-shadow:inset 0 0 0 1px #2E333D"); return b; };
        const close = (v) => { document.removeEventListener("keydown", onKey); wrap.remove(); try { prevFocus && prevFocus.focus && prevFocus.focus(); } catch (e) { } resolve(v); };
        const onKey = (e) => { if (e.key === "Escape") close(false); };
        if (!alertOnly) { const c = mk(cancel, false); c.onclick = () => close(false); row.appendChild(c); }
        const o = mk(alertOnly ? "Entendi" : ok, true); o.onclick = () => close(true); row.appendChild(o);
        wrap.onclick = (e) => { if (e.target === wrap) close(false); };
        box.append(h, p, row); wrap.appendChild(box); document.body.appendChild(wrap);
        document.addEventListener("keydown", onKey);
        setTimeout(() => o.focus(), 30);
    });
}
const ccConfirm = (message, opts = {}) => sheet({ ...opts, message });
const ccAlert = (message, opts = {}) => sheet({ ...opts, message, alertOnly: true });
export { ccConfirm, ccAlert };
