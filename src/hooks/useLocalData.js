import { saveGlobalToCloud, sb, withTimeout } from "../lib/supabaseClient";
import { applyGlobalToLocal, splitGlobalForCloud } from "../utils/merge";

const LS_KEY = "cancio:v9";
function loadLocal() { try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
}
catch (e) {
    return null;
} }
function saveLocal(d) {
    const stamped = { ...d, updatedAt: Date.now() };
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(stamped));
        return { ok: true, stamped };
    }
    catch (e) {
        console.error("Cancio: falha ao salvar local (armazenamento cheio?):", e);
        return { ok: false, stamped, error: e };
    }
}
// throttle real (não debounce): garante um teto de escritas por segundo mesmo sob mutação
// contínua (ex.: digitação com auto-save a cada 800ms), sem atrasar indefinidamente o pior caso
function throttle(fn, ms) {
    let last = 0, pending = null;
    return (...args) => {
        const now = Date.now();
        const run = () => { last = Date.now(); pending = null; fn(...args); };
        clearTimeout(pending);
        if (now - last >= ms)
            run();
        else
            pending = setTimeout(run, ms - (now - last));
    };
}
async function loadData() {
    const local = loadLocal();
    if (sb) {
        (async () => {
            try {
                const { data: rows, error } = await withTimeout(sb.from("cancio").select("*").eq("id", "global"), 12000);
                if (error)
                    throw error;
                if (rows && rows.length > 0) {
                    const cloudGlobal = rows[0].data || {};
                    if (local && local.updatedAt && local.updatedAt > (cloudGlobal.updatedAt || 0)) {
                        saveGlobalToCloud(splitGlobalForCloud(local));
                    }
                    else {
                        const merged = applyGlobalToLocal(local, cloudGlobal);
                        try {
                            localStorage.setItem(LS_KEY, JSON.stringify(merged));
                        }
                        catch (e) { }
                        if (window.__cancioCloudNewer)
                            window.__cancioCloudNewer(merged);
                    }
                }
            }
            catch (e) {
                console.error("Cancio: sem acesso à nuvem agora — seguindo só com os dados locais:", e);
            }
        })();
    }
    return local;
}
// Blindagem contra perda de dado: cada ExerciseCard se registra aqui enquanto montado. Antes de
// qualquer interrupção de fluxo (abrir o modal de esforço, finalizar, ou o app fechar) chamamos
// flushAllPendingSaves() pra descarregar imediatamente qualquer edição de carga/reps que ainda
// esteja só local, esperando o debounce de 800ms — sem isso, um toque rápido em "Finalizar"
// logo após digitar pode gravar o treino sem a última série (ou até vazio, se foi a única).
const pendingFlushes = new Set();
function flushAllPendingSaves() {
    try {
        if (document.activeElement && document.activeElement.blur)
            document.activeElement.blur();
    }
    catch (e) { } // força qualquer campo de digitação aberto (escape hatch do PressStep) a confirmar o valor
    pendingFlushes.forEach((fn) => { try {
        fn();
    }
    catch (e) { } });
}
export { LS_KEY, loadLocal, saveLocal, throttle, loadData, pendingFlushes, flushAllPendingSaves };
